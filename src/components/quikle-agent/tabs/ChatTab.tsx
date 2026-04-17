import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentMessage } from '../types';

interface Props {
  messages: AgentMessage[];
  isThinking: boolean;
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  'What are my open tasks?',
  'Show new leads',
  'Schedule a call with Acme',
  'Create a task',
];

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-3 py-2.5">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
        style={{
          animation: 'quikle-bounce 1.2s infinite ease-in-out',
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes quikle-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-3px); opacity: 1; }
      }
    `}</style>
  </div>
);

const ActionCard: React.FC<{ ok: boolean; summary: string }> = ({ ok, summary }) => (
  <div className="mt-2 flex items-start gap-2 px-2.5 py-2 text-xs rounded-md bg-muted/50 border border-border">
    {ok
      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
      : <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />}
    <span className="text-foreground">{summary}</span>
  </div>
);

const MeetingCard: React.FC<{ m: NonNullable<AgentMessage['meetingNotes']> }> = ({ m }) => (
  <div className="mt-2 p-3 text-xs space-y-2 rounded-md bg-muted/40 border border-border">
    {m.title && <div className="font-semibold text-sm text-foreground">{m.title}</div>}
    {m.summary && <p className="text-foreground/90">{m.summary}</p>}
    {!!m.decisions?.length && (
      <div>
        <div className="font-medium mb-1 text-muted-foreground uppercase tracking-wide text-[10px]">Decisions</div>
        <ul className="list-disc pl-4 space-y-0.5 text-foreground/90">
          {m.decisions.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    )}
    {!!m.action_items?.length && (
      <div>
        <div className="font-medium mb-1 text-muted-foreground uppercase tracking-wide text-[10px]">Action items</div>
        <ul className="space-y-1 text-foreground/90">
          {m.action_items.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 accent-primary" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {m.follow_up_date && (
      <div className="text-muted-foreground">📅 Follow-up: {m.follow_up_date}</div>
    )}
  </div>
);

const UpdateCard: React.FC<{ r: NonNullable<AgentMessage['updateReport']> }> = ({ r }) => {
  const [open, setOpen] = useState(false);
  const labelMap = { tasks: 'Tasks', leads: 'Leads', followups: 'Follow-ups' };
  return (
    <div className="mt-2 p-3 text-xs rounded-md bg-muted/40 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-foreground">{labelMap[r.entity]}</span>
        <span className="text-[10px] px-2 py-0.5 font-semibold rounded-full bg-primary text-primary-foreground">
          {r.count}
        </span>
      </div>
      <p className="text-foreground/90">{r.summary}</p>
      {r.items.length > 0 && (
        <>
          <button
            onClick={() => setOpen(o => !o)}
            className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? 'Hide details' : 'Show details'}
          </button>
          {open && (
            <ul className="mt-2 space-y-1 max-h-40 overflow-auto pr-1">
              {r.items.map((it, i) => (
                <li key={i} className="px-2 py-1 rounded bg-background text-foreground/90 border border-border">
                  {it.subject || it.name || it.contact || it.title || JSON.stringify(it).slice(0, 60)}
                  {it.status && <span className="text-muted-foreground"> · {it.status}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

const ChatTab: React.FC<Props> = ({ messages, isThinking, onSuggestion }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      {messages.length === 0 && !isThinking && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Hi! I'm Quikle AI. Ask me to manage your tasks, leads, and follow-ups.
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-foreground border border-border transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map(m => (
        <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'max-w-[85%] px-3 py-2 text-sm rounded-lg break-words',
              m.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            )}
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.actionResult && (
              <ActionCard ok={m.actionResult.ok} summary={m.actionResult.summary} />
            )}
            {m.meetingNotes && <MeetingCard m={m.meetingNotes} />}
            {m.updateReport && <UpdateCard r={m.updateReport} />}
          </div>
        </div>
      ))}

      {isThinking && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg rounded-tl-sm">
            <TypingDots />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatTab;
