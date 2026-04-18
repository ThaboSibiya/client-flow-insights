import React, { useState } from 'react';
import { Mic, Pause, Square, RotateCcw, AlertTriangle, Play, Save } from 'lucide-react';
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
    <span className={cn('inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 font-medium rounded-full', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
};

const Waveform: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center justify-center gap-0.5 h-3">
    {[0, 1, 2, 3, 4].map(i => (
      <span
        key={i}
        className={cn(
          'w-0.5 rounded-full bg-destructive/70',
          active ? 'quikle-wave' : 'h-1'
        )}
        style={active ? { animationDelay: `${i * 0.12}s` } : undefined}
      />
    ))}
    <style>{`
      @keyframes quikle-wave-anim {
        0%, 100% { height: 3px; }
        50% { height: 12px; }
      }
      .quikle-wave { animation: quikle-wave-anim 0.9s ease-in-out infinite; }
    `}</style>
  </div>
);

const MeetingTab: React.FC<Props> = ({ onSave }) => {
  const sp = useSpeechTranscript();
  const [title, setTitle] = useState('');
  const [manual, setManual] = useState('');

  const transcript = sp.supported ? sp.finalText.trim() : manual.trim();
  const canSave = transcript.length > 0;
  const isRecording = sp.state === 'recording';
  const hasContent = !!sp.finalText || !!sp.interim;

  const handleSave = () => {
    if (!canSave) return;
    onSave(transcript, title);
    setTitle('');
    setManual('');
    sp.reset();
  };

  const handlePrimaryAction = () => {
    if (sp.state === 'idle' || sp.state === 'done') sp.start();
    else if (sp.state === 'recording') sp.pause();
    else if (sp.state === 'paused') sp.resume();
  };

  const PrimaryIcon = isRecording ? Pause : (sp.state === 'paused' ? Play : Mic);

  if (!sp.supported) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-start gap-2 p-2.5 text-xs rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>Live transcription not supported. Paste your transcript manually.</span>
          </div>
          <textarea
            value={manual}
            onChange={e => setManual(e.target.value)}
            placeholder="Paste meeting transcript here…"
            className="w-full flex-1 p-3 text-sm rounded-lg bg-muted/30 border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 resize-none placeholder:text-muted-foreground transition-all"
            rows={10}
            style={{ minHeight: 200 }}
          />
        </div>
        <div className="p-3 border-t border-border/60 bg-card space-y-2">
          {canSave && (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Meeting title (optional)"
              className="w-full h-9 px-3 text-sm rounded-md bg-background border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 placeholder:text-muted-foreground transition-all"
            />
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'w-full h-10 text-sm font-semibold rounded-md transition-all inline-flex items-center justify-center gap-2',
              'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
              'hover:shadow-md active:scale-[0.99]',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            <Save className="h-4 w-4" /> Save & Summarise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Transcript area — flex-grow to fill available space */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pt-3 pb-2 gap-2">
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Transcript</span>
          <StatusPill state={sp.state} />
        </div>
        <div
          className={cn(
            'flex-1 min-h-0 p-3 text-sm overflow-y-auto rounded-lg border transition-colors',
            'bg-muted/30 border-border',
            isRecording && 'border-destructive/30 bg-destructive/[0.02]'
          )}
        >
          {hasContent ? (
            <>
              <span className="text-foreground leading-relaxed">{sp.finalText}</span>
              {sp.interim && (
                <span className="italic text-muted-foreground">{sp.interim}</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              {isRecording ? 'Listening… start speaking' : 'Tap the microphone below to begin recording'}
            </span>
          )}
        </div>

        {/* Compact meta row */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 flex-shrink-0">
          <span>{sp.wordCount} {sp.wordCount === 1 ? 'word' : 'words'}</span>
          <Waveform active={isRecording} />
          <span className="font-mono tabular-nums">{fmtTime(sp.elapsed)}</span>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="flex-shrink-0 border-t border-border/60 bg-card p-3 space-y-2">
        {/* Title field — only when there's content */}
        {hasContent && (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Meeting title (optional)"
            className="w-full h-8 px-3 text-xs rounded-md bg-background border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 placeholder:text-muted-foreground transition-all"
          />
        )}

        {/* Action row: record button + secondary actions + save */}
        <div className="flex items-center gap-2">
          {/* Record button */}
          <div className="relative flex-shrink-0">
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
            )}
            <button
              onClick={handlePrimaryAction}
              aria-label={isRecording ? 'Pause recording' : sp.state === 'paused' ? 'Resume recording' : 'Start recording'}
              className={cn(
                'relative h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200',
                'shadow-md active:scale-95',
                isRecording
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-105'
              )}
            >
              <PrimaryIcon className={cn('h-4 w-4', isRecording && 'fill-current')} />
            </button>
          </div>

          {/* Secondary controls */}
          {(sp.state === 'recording' || sp.state === 'paused') && (
            <button
              onClick={sp.stop}
              aria-label="Stop"
              className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex-shrink-0"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          )}
          {(sp.finalText || sp.state !== 'idle') && (
            <button
              onClick={sp.reset}
              aria-label="Reset"
              className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex-shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Save — fills remaining space */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'flex-1 h-10 text-sm font-semibold rounded-full transition-all inline-flex items-center justify-center gap-1.5',
              'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
              'hover:shadow-md active:scale-[0.99]',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            <Save className="h-3.5 w-3.5" /> Save & Summarise
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingTab;
