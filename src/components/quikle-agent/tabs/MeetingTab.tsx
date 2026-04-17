import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSpeechTranscript } from '../useSpeechTranscript';

interface Props {
  onSave: (transcript: string, title: string) => void;
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
};

const StatusPill: React.FC<{ state: string }> = ({ state }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    idle: { label: 'Ready', bg: '#334155', color: '#e2e8f0' },
    recording: { label: '🔴 Recording', bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
    paused: { label: '⏸ Paused', bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    done: { label: '✓ Done', bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  };
  const s = map[state] || map.idle;
  return (
    <span
      className="text-xs px-2.5 py-1 font-medium"
      style={{ background: s.bg, color: s.color, borderRadius: 999 }}
    >
      {s.label}
    </span>
  );
};

const MeetingTab: React.FC<Props> = ({ onSave }) => {
  const sp = useSpeechTranscript();
  const [title, setTitle] = useState('');
  const [manual, setManual] = useState('');

  const transcript = sp.supported ? sp.finalText.trim() : manual.trim();
  const canSave = transcript.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(transcript, title);
    setTitle('');
    setManual('');
    sp.reset();
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-3 space-y-3"
      style={{ background: '#0f172a' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>STATUS</span>
        <StatusPill state={sp.state} />
      </div>

      {!sp.supported ? (
        <>
          <div
            className="flex items-start gap-2 p-3 text-xs"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
              borderRadius: 8,
            }}
          >
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>Live transcription not supported in this browser. Paste your transcript manually.</span>
          </div>
          <textarea
            value={manual}
            onChange={e => setManual(e.target.value)}
            placeholder="Paste meeting transcript here…"
            className="w-full p-3 text-sm outline-none resize-none"
            rows={8}
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: 10,
              minHeight: 150,
            }}
          />
        </>
      ) : (
        <>
          <div
            className="p-3 text-sm overflow-y-auto"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              minHeight: 150,
              maxHeight: 200,
              color: '#e2e8f0',
            }}
          >
            {sp.finalText || sp.interim ? (
              <>
                <span>{sp.finalText}</span>
                {sp.interim && (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>{sp.interim}</span>
                )}
              </>
            ) : (
              <span style={{ color: '#64748b' }}>Your transcript will appear here as you speak…</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs" style={{ color: '#94a3b8' }}>
            <span>{sp.wordCount} words</span>
            <span>{fmtTime(sp.elapsed)}</span>
          </div>

          <div className="flex items-center gap-2">
            {sp.state === 'idle' && (
              <button onClick={sp.start} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                style={{ background: '#22c55e', color: 'white', borderRadius: 8 }}>
                <Play size={14} /> Start
              </button>
            )}
            {sp.state === 'recording' && (
              <>
                <button onClick={sp.pause} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                  style={{ background: '#f59e0b', color: 'white', borderRadius: 8 }}>
                  <Pause size={14} /> Pause
                </button>
                <button onClick={sp.stop} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                  style={{ background: '#ef4444', color: 'white', borderRadius: 8 }}>
                  <Square size={14} /> Stop
                </button>
              </>
            )}
            {sp.state === 'paused' && (
              <>
                <button onClick={sp.resume} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                  style={{ background: '#22c55e', color: 'white', borderRadius: 8 }}>
                  <Play size={14} /> Resume
                </button>
                <button onClick={sp.stop} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                  style={{ background: '#ef4444', color: 'white', borderRadius: 8 }}>
                  <Square size={14} /> Stop
                </button>
              </>
            )}
            {sp.state === 'done' && (
              <button onClick={sp.start} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium"
                style={{ background: '#22c55e', color: 'white', borderRadius: 8 }}>
                <Play size={14} /> Start new
              </button>
            )}
            <button onClick={sp.reset} className="flex items-center gap-1 px-2 py-2 text-xs"
              style={{ color: '#64748b', background: 'transparent', border: 'none' }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </>
      )}

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Meeting title (optional)"
        className="w-full px-3 py-2 text-sm outline-none"
        style={{
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          borderRadius: 10,
        }}
      />

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          borderRadius: 10,
          border: 'none',
        }}
      >
        Save & Summarise
      </button>
    </div>
  );
};

export default MeetingTab;
