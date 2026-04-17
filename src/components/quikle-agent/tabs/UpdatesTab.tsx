import React from 'react';
import { ListChecks, Users, CalendarClock, ChevronRight, LucideIcon } from 'lucide-react';

interface Props {
  onPick: (entity: 'tasks' | 'leads' | 'followups') => void;
}

const items: Array<{ key: 'tasks' | 'leads' | 'followups'; icon: LucideIcon; title: string; sub: string }> = [
  { key: 'tasks', icon: ListChecks, title: 'Task Update', sub: 'Open items & priorities' },
  { key: 'leads', icon: Users, title: 'Lead Update', sub: 'New leads & pipeline' },
  { key: 'followups', icon: CalendarClock, title: 'Follow-up Update', sub: 'Upcoming contacts' },
];

const UpdatesTab: React.FC<Props> = ({ onPick }) => (
  <div className="flex-1 overflow-y-auto p-3 space-y-2">
    <div className="text-xs text-muted-foreground mb-1">
      Get a quick AI-summarised report on your CRM.
    </div>
    {items.map(it => {
      const Icon = it.icon;
      return (
        <button
          key={it.key}
          onClick={() => onPick(it.key)}
          className="w-full text-left p-3 rounded-lg bg-muted/40 hover:bg-muted border border-border hover:border-border/80 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-background border border-border">
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      );
    })}
  </div>
);

export default UpdatesTab;
