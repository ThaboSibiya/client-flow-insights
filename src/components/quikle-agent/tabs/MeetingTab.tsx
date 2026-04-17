import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSpeechTranscript } from '../useSpeechTranscript';
import { cn } from '@/lib/utils';

interface Props {
  onSave: (transcript: string, title: string) => void;
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
};

const StatusPill: React.FC<{ state: string }> = ({ state }) => {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    idle: { label: 'Ready', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
    recording: { label: 'Recording', cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive animate-pulse' },
    paused: { label: 'Paused', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-500', dot: 'bg-amber-500' },
    done: { label: 'Done', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500', dot: 'bg-emerald-500' },
  };
  const s = map[state] || map.idle;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 font-medium rounded-full', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
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
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</span>
        <StatusPill state={sp.state} />
      </div>

      {!sp.supported ? (
        <>
          <div className="flex items-start gap-2 p-2.5 text-xs rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>Live transcription not supported in this browser. Paste your transcript manually.</span>
          </div>
          <textarea
            value={manual}
            onChange={e => setManual(e.target.value)}
            placeholder="Paste meeting transcript here…"
            className="w-full p-3 text-sm rounded-md bg-muted/40 border border-border outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
            rows={8}
            style={{ minHeight: 150 }}
          />
        </>
      ) : (
        <>
          <div
            className="p-3 text-sm overflow-y-auto rounded-md bg-muted/40 border border-border"
            style={{ minHeight: 150, maxHeight: 200 }}
          >
            {sp.finalText || sp.interim ? (
              <>
                <span className="text-foreground">{sp.finalText}</span>
                {sp.interim && (
                  <span className="italic text-muted-foreground">{sp.interim}</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Your transcript will appear here as you speak…</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{sp.wordCount} words</span>
            <span className="font-mono">{fmtTime(sp.elapsed)}</span>
          </div>

          <div className="flex items-center gap-2">
            {sp.state === 'idle' && (
              <button onClick={sp.start} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Play className="h-3.5 w-3.5" /> Start
              </button>
            )}
            {sp.state === 'recording' && (
              <>
                <button onClick={sp.pause} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
                <button onClick={sp.stop} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
              </>
            )}
            {sp.state === 'paused' && (
              <>
                <button onClick={sp.resume} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Play className="h-3.5 w-3.5" /> Resume
                </button>
                <button onClick={sp.stop} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                  <Square className="h-3.5 w-3.5" /> Stop
                </button>
              </>
            )}
            {sp.state === 'done' && (
              <button onClick={sp.start} className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Play className="h-3.5 w-3.5" /> Start new
              </button>
            )}
            <button onClick={sp.reset} className="inline-flex items-center gap-1 px-2 h-9 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </>
      )}

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Meeting title (optional)"
        className="w-full h-9 px-3 text-sm rounded-md bg-background border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
      />

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full h-10 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Save & Summarise
      </button>
    </div>
  );
};

export default MeetingTab;
