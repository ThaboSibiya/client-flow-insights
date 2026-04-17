import React from 'react';

interface Props {
  onPick: (entity: 'tasks' | 'leads' | 'followups') => void;
}

const items: Array<{ key: 'tasks' | 'leads' | 'followups'; emoji: string; title: string; sub: string }> = [
  { key: 'tasks', emoji: '📋', title: 'Task Update', sub: 'Open items & priorities' },
  { key: 'leads', emoji: '👥', title: 'Lead Update', sub: 'New leads & pipeline' },
  { key: 'followups', emoji: '📅', title: 'Follow-up Update', sub: 'Upcoming contacts' },
];

const UpdatesTab: React.FC<Props> = ({ onPick }) => (
  <div
    className="flex-1 overflow-y-auto p-3 space-y-3"
    style={{ background: '#0f172a' }}
  >
    <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>
      Get a quick AI-summarised report on your CRM.
    </div>
    {items.map(it => (
      <button
        key={it.key}
        onClick={() => onPick(it.key)}
        className="w-full text-left p-4 transition-colors"
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          color: '#e2e8f0',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#263347')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 22 }}>{it.emoji}</span>
          <div>
            <div className="font-semibold text-sm">{it.title}</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>{it.sub}</div>
          </div>
        </div>
      </button>
    ))}
  </div>
);

export default UpdatesTab;
