import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  <div className="flex items-center gap-1 px-3 py-2">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#6366f1',
          display: 'inline-block',
          animation: `quikle-bounce 1.2s infinite ease-in-out`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes quikle-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
    `}</style>
  </div>
);

const ActionCard: React.FC<{ ok: boolean; summary: string }> = ({ ok, summary }) => (
  <div
    className="mt-2 flex items-start gap-2 px-3 py-2 text-xs"
    style={{
      background: 'rgba(99,102,241,0.12)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 8,
      color: '#e2e8f0',
    }}
  >
    {ok
      ? <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }} />
      : <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />}
    <span>{summary}</span>
  </div>
);

const MeetingCard: React.FC<{ m: NonNullable<AgentMessage['meetingNotes']> }> = ({ m }) => (
  <div
    className="mt-2 p-3 text-xs space-y-2"
    style={{
      background: 'rgba(99,102,241,0.08)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 10,
    }}
  >
    {m.title && <div className="font-semibold text-sm" style={{ color: '#a5b4fc' }}>{m.title}</div>}
    {m.summary && <p style={{ color: '#e2e8f0' }}>{m.summary}</p>}
    {!!m.decisions?.length && (
      <div>
        <div className="font-medium mb-1" style={{ color: '#94a3b8' }}>Decisions</div>
        <ul className="list-disc pl-4 space-y-0.5" style={{ color: '#e2e8f0' }}>
          {m.decisions.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    )}
    {!!m.action_items?.length && (
      <div>
        <div className="font-medium mb-1" style={{ color: '#94a3b8' }}>Action items</div>
        <ul className="space-y-1" style={{ color: '#e2e8f0' }}>
          {m.action_items.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
    {m.follow_up_date && (
      <div style={{ color: '#f59e0b' }}>📅 Follow-up: {m.follow_up_date}</div>
    )}
  </div>
);

const UpdateCard: React.FC<{ r: NonNullable<AgentMessage['updateReport']> }> = ({ r }) => {
  const [open, setOpen] = useState(false);
  const labelMap = { tasks: 'Tasks', leads: 'Leads', followups: 'Follow-ups' };
  return (
    <div
      className="mt-2 p-3 text-xs"
      style={{
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 10,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm" style={{ color: '#a5b4fc' }}>{labelMap[r.entity]}</span>
        <span
          className="text-[10px] px-2 py-0.5 font-semibold"
          style={{ background: '#6366f1', color: 'white', borderRadius: 999 }}
        >
          {r.count}
        </span>
      </div>
      <p style={{ color: '#e2e8f0' }}>{r.summary}</p>
      {r.items.length > 0 && (
        <>
          <button
            onClick={() => setOpen(o => !o)}
            className="mt-2 flex items-center gap-1 text-[11px]"
            style={{ color: '#a5b4fc' }}
          >
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {open ? 'Hide details' : 'Show details'}
          </button>
          {open && (
            <ul className="mt-2 space-y-1 max-h-40 overflow-auto pr-1" style={{ color: '#e2e8f0' }}>
              {r.items.map((it, i) => (
                <li key={i} className="px-2 py-1" style={{ background: '#0f172a', borderRadius: 6 }}>
                  {it.subject || it.name || it.contact || it.title || JSON.stringify(it).slice(0, 60)}
                  {it.status && <span style={{ color: '#94a3b8' }}> · {it.status}</span>}
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
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ background: '#0f172a' }}>
      {messages.length === 0 && !isThinking && (
        <div className="space-y-3">
          <div className="text-sm" style={{ color: '#94a3b8' }}>
            Hi! I'm Quikle AI. Ask me to manage your tasks, leads, and follow-ups.
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="text-xs px-3 py-1.5 transition-colors"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#a5b4fc',
                  borderRadius: 999,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map(m => (
        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className="max-w-[85%] px-3 py-2 text-sm"
            style={{
              background: m.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : '#1e293b',
              color: m.role === 'user' ? '#ffffff' : '#e2e8f0',
              borderRadius: 12,
              borderTopRightRadius: m.role === 'user' ? 4 : 12,
              borderTopLeftRadius: m.role === 'user' ? 12 : 4,
              wordBreak: 'break-word',
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
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
          <div style={{ background: '#1e293b', borderRadius: 12, borderTopLeftRadius: 4 }}>
            <TypingDots />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatTab;
