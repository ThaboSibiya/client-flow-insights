import React from 'react';
import { AlertTriangle, RefreshCw, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentAlerts, type AgentAlert } from '../useAgentAlerts';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  onActOnAlert?: (alert: AgentAlert) => void;
}

const severityStyles: Record<AgentAlert['severity'], string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  info: 'bg-muted text-muted-foreground border-border',
};

const InboxTab: React.FC<Props> = ({ onActOnAlert }) => {
  const { alerts, loading, scanning, scan, resolve, dismiss } = useAgentAlerts();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/60">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{alerts.length} open alert{alerts.length === 1 ? '' : 's'}</span>
        </div>
        <button
          onClick={() => void scan()}
          disabled={scanning}
          className={cn(
            'flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md',
            'bg-muted/50 hover:bg-muted text-foreground transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {scanning
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <RefreshCw className="h-3 w-3" />}
          {scanning ? 'Scanning…' : 'Scan now'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 [&::-webkit-scrollbar]:hidden">
        {loading && (
          <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> Loading alerts…
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nothing needs your attention right now. Hit “Scan now” to re-check.
            </p>
          </div>
        )}

        {alerts.map(a => (
          <div
            key={a.id}
            className="rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:border-border transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className={cn(
                'mt-0.5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide rounded border font-medium',
                severityStyles[a.severity]
              )}>
                {a.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">{a.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.message}</p>
                <p className="text-[9px] text-muted-foreground/70 mt-1">
                  {(() => { try { return formatDistanceToNow(new Date(a.created_at), { addSuffix: true }); } catch { return ''; } })()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-2">
              {a.suggested_action && onActOnAlert && (
                <button
                  onClick={() => onActOnAlert(a)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="h-2.5 w-2.5" /> Act
                </button>
              )}
              <button
                onClick={() => void resolve(a.id)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <Check className="h-2.5 w-2.5" /> Resolve
              </button>
              <button
                onClick={() => void dismiss(a.id)}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-2.5 w-2.5" /> Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxTab;
