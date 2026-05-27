import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'quikle-agent:speak-replies';

/**
 * Persisted "speak replies" toggle with robust voice loading.
 * Browser SpeechSynthesis with onvoiceschanged race fix + cached voice pick.
 */
export function useSpeakReply() {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  });
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const pickVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    voiceRef.current =
      voices.find(v => /en-(US|GB|ZA)/i.test(v.lang) && /female|samantha|google|natural/i.test(v.name)) ||
      voices.find(v => /^en/i.test(v.lang)) ||
      voices[0] ||
      null;
  }, []);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    pickVoice();
    const handler = () => pickVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
  }, [pickVoice]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try { window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0'); } catch { /* noop */ }
    if (!v) window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    if (!enabled || !text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip basic markdown for nicer TTS
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/[*_#>~`]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.0;
    u.pitch = 1.0;
    if (voiceRef.current) u.voice = voiceRef.current;
    window.speechSynthesis.speak(u);
  }, [enabled]);

  const cancel = useCallback(() => { window.speechSynthesis?.cancel(); }, []);

  return { enabled, setEnabled, speak, cancel };
}
