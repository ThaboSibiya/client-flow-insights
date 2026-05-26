import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Phase = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';

interface QuikleVoiceSessionProps {
  onSpeakingChange: (speaking: boolean) => void;
}

/**
 * Lightweight voice agent (Option B):
 *  - MediaRecorder captures audio (push-to-talk)
 *  - Groq Whisper (free tier) transcribes via `groq-transcribe` edge function
 *  - Existing `quikle-agent` (OpenRouter free models) generates reply
 *  - Browser SpeechSynthesis speaks the reply
 */
const QuikleVoiceSession: React.FC<QuikleVoiceSessionProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      try { recorderRef.current?.stop(); } catch { /* ignore */ }
      cleanupStream();
      window.speechSynthesis?.cancel();
    };
  }, [cleanupStream]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /en-(US|GB|ZA)/i.test(v.lang) && /female|samantha|google/i.test(v.name))
      || voices.find(v => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    u.onstart = () => { setPhase('speaking'); onSpeakingChange(true); };
    u.onend = () => { setPhase('idle'); onSpeakingChange(false); };
    u.onerror = () => { setPhase('idle'); onSpeakingChange(false); };
    window.speechSynthesis.speak(u);
  }, [onSpeakingChange]);

  const runAgent = useCallback(async (text: string) => {
    setPhase('thinking');
    try {
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'chat', message: text, history },
      });
      if (error) throw error;
      const replyText: string = data?.reply ?? 'Sorry, I had no response.';
      setReply(replyText);
      setHistory(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: replyText }].slice(-20));
      speak(replyText);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Agent error';
      toast({ title: 'Agent error', description: msg, variant: 'destructive' });
      setPhase('idle');
    }
  }, [history, speak, toast]);

  const transcribe = useCallback(async (blob: Blob) => {
    setPhase('transcribing');
    try {
      const form = new FormData();
      form.append('file', blob, 'speech.webm');
      const { data, error } = await supabase.functions.invoke('groq-transcribe', { body: form });
      if (error) throw error;
      const text: string = (data?.text || '').trim();
      setTranscript(text);
      if (!text) {
        toast({ title: 'No speech detected', description: 'Try speaking a bit longer.' });
        setPhase('idle');
        return;
      }
      await runAgent(text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transcription failed';
      toast({ title: 'Transcription error', description: msg, variant: 'destructive' });
      setPhase('idle');
    }
  }, [runAgent, toast]);

  const startListening = useCallback(async () => {
    if (phase !== 'idle') return;
    try {
      window.speechSynthesis?.cancel();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 1000) {
          toast({ title: 'Too short', description: 'Hold the button while speaking.' });
          setPhase('idle');
          return;
        }
        void transcribe(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setPhase('listening');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Mic error';
      toast({ title: 'Microphone error', description: msg, variant: 'destructive' });
      setPhase('idle');
    }
  }, [phase, transcribe, toast, cleanupStream]);

  const stopListening = useCallback(() => {
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const cancelAll = useCallback(() => {
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    cleanupStream();
    window.speechSynthesis?.cancel();
    setPhase('idle');
    onSpeakingChange(false);
  }, [cleanupStream, onSpeakingChange]);

  const label = {
    idle: 'Hold to talk',
    listening: 'Listening… release to send',
    transcribing: 'Transcribing…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
  }[phase];

  const busy = phase === 'transcribing' || phase === 'thinking';

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="min-h-[3rem] text-center text-sm text-muted-foreground px-4">
        {transcript && <p className="italic">"{transcript}"</p>}
        {reply && <p className="mt-1 text-foreground">{reply}</p>}
        {!transcript && !reply && <p>Press and hold the mic to ask Quikle anything.</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          disabled={busy}
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onMouseLeave={() => phase === 'listening' && stopListening()}
          onTouchStart={(e) => { e.preventDefault(); startListening(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
          className={`rounded-full h-16 w-16 shadow-lg transition-colors ${
            phase === 'listening' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" />
            : phase === 'listening' ? <Square className="h-6 w-6" />
            : <Mic className="h-6 w-6" />}
        </Button>

        {(phase === 'speaking' || phase === 'listening') && (
          <Button variant="outline" size="sm" onClick={cancelAll}>
            <MicOff className="h-4 w-4 mr-1" /> Stop
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

export default QuikleVoiceSession;
