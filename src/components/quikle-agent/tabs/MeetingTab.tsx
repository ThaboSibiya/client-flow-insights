import React, { useState } from 'react';
import { Mic, Pause, Square, RotateCcw, AlertTriangle, Play } from 'lucide-react';
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

// Animated waveform bars for recording feedback
const Waveform: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center justify-center gap-0.5 h-4">
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
        0%, 100% { height: 4px; }
        50% { height: 16px; }
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            className="w-full p-3 text-sm rounded-lg bg-muted/30 border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 resize-none placeholder:text-muted-foreground transition-all"
            rows={12}
            style={{ minHeight: 280 }}
          />
        </>
      ) : (
        <>
          {/* Transcript area — dominant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Transcript</span>
              <StatusPill state={sp.state} />
            </div>
            <div
              className={cn(
                'p-3.5 text-sm overflow-y-auto rounded-lg border transition-colors',
                'bg-muted/30 border-border',
                isRecording && 'border-destructive/30 bg-destructive/[0.02]'
              )}
              style={{ minHeight: 240, maxHeight: 280 }}
            >
              {sp.finalText || sp.interim ? (
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
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>{sp.wordCount} {sp.wordCount === 1 ? 'word' : 'words'}</span>
            <Waveform active={isRecording} />
            <span className="font-mono tabular-nums">{fmtTime(sp.elapsed)}</span>
          </div>

          {/* Centered circular record button */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative">
              {isRecording && (
                <span className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
              )}
              <button
                onClick={handlePrimaryAction}
                aria-label={isRecording ? 'Pause recording' : 'Start recording'}
                className={cn(
                  'relative h-14 w-14 flex items-center justify-center rounded-full transition-all duration-200',
                  'shadow-lg hover:shadow-xl active:scale-95',
                  isRecording
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-105'
                )}
              >
                <PrimaryIcon className={cn('h-5 w-5', isRecording && 'fill-current')} />
              </button>
            </div>

            {/* Secondary actions row */}
            <div className="flex items-center gap-1">
              {(sp.state === 'recording' || sp.state === 'paused') && (
                <button
                  onClick={sp.stop}
                  className="inline-flex items-center gap-1 px-2.5 h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Square className="h-3 w-3" /> Stop
                </button>
              )}
              {(sp.finalText || sp.state !== 'idle') && (
                <button
                  onClick={sp.reset}
                  className="inline-flex items-center gap-1 px-2.5 h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Save section */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Meeting title (optional)"
          className="w-full h-9 px-3 text-sm rounded-md bg-background border border-border outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 placeholder:text-muted-foreground transition-all"
        />

        <button
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'w-full h-10 text-sm font-semibold rounded-md transition-all',
            'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
            'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none'
          )}
        >
          Save & Summarise
        </button>
      </div>
    </div>
  );
};

export default MeetingTab;
