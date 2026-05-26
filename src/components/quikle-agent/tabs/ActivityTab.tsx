import React from 'react';
import { Activity, CheckCircle2, XCircle, Undo2, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useActionLog } from '../useActionLog';

const statusColor: Record<string, string> = {
  done: 'text-emerald-500',
  failed: 'text-destructive',
  undone: 'text-amber-500',
  running: 'text-primary',
  pending: 'text-muted-foreground',
  skipped: 'text-muted-foreground',
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'done': return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'failed': return <XCircle className="h-3.5 w-3.5" />;
    case 'undone': return <Undo2 className="h-3.5 w-3.5" />;
    case 'running': return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    default: return <Activity className="h-3.5 w-3.5" />;
  }
};

const ActivityTab: React.FC = () => {
  const { entries, loading, reload } = useActionLog();

  // Group by plan_id, newest plan first.
  const plans = Object.values(
    entries.reduce<Record<string, { id: string; title: string; createdAt: string; rows: typeof entries }>>((acc, row) => {
      const k = row.plan_id;
      if (!acc[k]) acc[k] = { id: k, title: row.plan_title || 'Untitled plan', createdAt: row.created_at, rows: [] };
      acc[k].rows.push(row);
      if (row.created_at > acc[k].createdAt) acc[k].createdAt = row.created_at;
      return acc;
    }, {})
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/60">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>{plans.length} plan{plans.length === 1 ? '' : 's'}</span>
        </div>
        <button
          onClick={() => void reload()}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 [&::-webkit-scrollbar]:hidden">
        {!loading && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-step plans the agent runs will show up here.
            </p>
          </div>
        )}

        {plans.map(p => (
          <div key={p.id} className="rounded-lg border border-border/60 bg-card/60 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground truncate">{p.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {p.rows.sort((a, b) => a.step_index - b.step_index).map(r => (
                <div key={r.id} className="px-3 py-1.5 flex items-center gap-2 text-[11px]">
                  <span className={cn('shrink-0', statusColor[r.status] ?? 'text-muted-foreground')}>
                    <StatusIcon status={r.status} />
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">
                    {String(r.step_index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 truncate text-foreground">{r.tool_name}</span>
                  <span className={cn('text-[10px] uppercase tracking-wide', statusColor[r.status] ?? 'text-muted-foreground')}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTab;
