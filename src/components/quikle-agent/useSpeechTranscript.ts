import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechState = 'idle' | 'recording' | 'paused' | 'done';

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: (() => void) | null;
}

export function useSpeechTranscript() {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<SpeechState>('idle');
  const [finalText, setFinalText] = useState('');
  const [interim, setInterim] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const wantRunningRef = useRef(false);

  useEffect(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      const base = accumulatedRef.current;
      const live = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      setElapsed(Math.floor((base + live) / 1000));
    }, 250);
  }, []);

  const stopTimer = useCallback(() => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    if (startedAtRef.current) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
  }, []);

  const buildRecognizer = useCallback(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return null;
    const r: SpeechRecognitionLike = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || 'en-US';
    r.onresult = (e: any) => {
      let f = '';
      let i = '';
      for (let idx = e.resultIndex; idx < e.results.length; idx++) {
        const res = e.results[idx];
        if (res.isFinal) f += res[0].transcript + ' ';
        else i += res[0].transcript;
      }
      if (f) setFinalText(prev => (prev + f).replace(/\s+/g, ' ').trim() + ' ');
      setInterim(i);
    };
    r.onerror = (e: any) => {
      // ignore "no-speech" errors; otherwise stop
      if (e?.error && e.error !== 'no-speech' && e.error !== 'aborted') {
        wantRunningRef.current = false;
      }
    };
    r.onend = () => {
      // auto-restart if user still wants it running (Chrome stops after silence)
      if (wantRunningRef.current) {
        try { r.start(); } catch { /* ignore */ }
      }
    };
    return r;
  }, []);

  const start = useCallback(() => {
    if (!supported) return;
    const r = buildRecognizer();
    if (!r) return;
    recognitionRef.current = r;
    wantRunningRef.current = true;
    try { r.start(); } catch { /* already started */ }
    setState('recording');
    startTimer();
  }, [supported, buildRecognizer, startTimer]);

  const pause = useCallback(() => {
    wantRunningRef.current = false;
    recognitionRef.current?.stop();
    stopTimer();
    setState('paused');
  }, [stopTimer]);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const stop = useCallback(() => {
    wantRunningRef.current = false;
    recognitionRef.current?.stop();
    stopTimer();
    setInterim('');
    setState('done');
  }, [stopTimer]);

  const reset = useCallback(() => {
    wantRunningRef.current = false;
    recognitionRef.current?.abort();
    stopTimer();
    accumulatedRef.current = 0;
    setElapsed(0);
    setFinalText('');
    setInterim('');
    setState('idle');
  }, [stopTimer]);

  useEffect(() => () => {
    wantRunningRef.current = false;
    recognitionRef.current?.abort();
    if (tickRef.current) window.clearInterval(tickRef.current);
  }, []);

  const wordCount = finalText.trim() ? finalText.trim().split(/\s+/).length : 0;

  return { supported, state, finalText, interim, elapsed, wordCount,
    start, pause, resume, stop, reset, setFinalText };
}
