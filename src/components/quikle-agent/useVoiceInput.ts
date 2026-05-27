import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VoicePhase = 'idle' | 'listening' | 'transcribing';

interface Options {
  onTranscript: (text: string) => void;
  /** Auto-stop after N ms of silence. Default 1200ms. */
  silenceMs?: number;
  /** RMS threshold (0..1) under which audio counts as silent. Default 0.015 */
  silenceThreshold?: number;
}

/**
 * Mic-button voice input for the Quikle Agent composer.
 * - MediaRecorder → Groq Whisper (via groq-transcribe edge function)
 * - VAD-based auto-stop on silence
 * - Cancels any active SpeechSynthesis when mic opens (barge-in)
 */
export function useVoiceInput({ onTranscript, silenceMs = 1200, silenceThreshold = 0.015 }: Options) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<VoicePhase>('idle');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVoiceAtRef = useRef<number>(0);
  const hasSpokenRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { analyserRef.current?.disconnect(); } catch { /* noop */ }
    analyserRef.current = null;
    try { audioCtxRef.current?.close(); } catch { /* noop */ }
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => { cleanup(); }, [cleanup]);

  const transcribe = useCallback(async (blob: Blob) => {
    setPhase('transcribing');
    try {
      const form = new FormData();
      form.append('file', blob, 'speech.webm');
      const { data, error } = await supabase.functions.invoke('groq-transcribe', { body: form });
      if (error) throw error;
      const text = (data?.text || '').trim();
      if (!text) {
        toast({ title: 'No speech detected', description: 'Try speaking a bit longer.' });
      } else {
        onTranscript(text);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transcription failed';
      toast({ title: 'Voice error', description: msg, variant: 'destructive' });
    } finally {
      setPhase('idle');
    }
  }, [onTranscript, toast]);

  const stop = useCallback(() => {
    try { recorderRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const start = useCallback(async () => {
    if (phase !== 'idle') return;
    try {
      // Barge-in: silence any agent TTS
      window.speechSynthesis?.cancel();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        cleanup();
        if (blob.size < 1000 || !hasSpokenRef.current) {
          toast({ title: 'Too short', description: 'Hold the mic a moment while speaking.' });
          setPhase('idle');
          return;
        }
        void transcribe(blob);
      };

      // VAD setup
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      hasSpokenRef.current = false;
      lastVoiceAtRef.current = performance.now();
      const buf = new Uint8Array(analyser.fftSize);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buf.length);
        const now = performance.now();
        if (rms > silenceThreshold) {
          hasSpokenRef.current = true;
          lastVoiceAtRef.current = now;
        } else if (hasSpokenRef.current && now - lastVoiceAtRef.current > silenceMs) {
          stop();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rec.start();
      setPhase('listening');
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Microphone error';
      toast({ title: 'Microphone error', description: msg, variant: 'destructive' });
      cleanup();
      setPhase('idle');
    }
  }, [phase, cleanup, transcribe, stop, silenceMs, silenceThreshold, toast]);

  const toggle = useCallback(() => {
    if (phase === 'listening') stop();
    else if (phase === 'idle') void start();
  }, [phase, start, stop]);

  return { phase, start, stop, toggle };
}
