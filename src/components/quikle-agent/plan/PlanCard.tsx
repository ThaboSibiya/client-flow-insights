import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, XCircle, Play, Pencil, Ban, Undo2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentPlan, PlanStep } from '../types';

interface Props {
  plan: AgentPlan;
  onApprove: (planId: string, enabledIndices: number[]) => void;
  onCancel: (planId: string) => void;
  onUndo: (planId: string) => void;
}

const statusIcon = (s: PlanStep['status']) => {
  switch (s) {
    case 'running': return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />;
    case 'done': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case 'failed': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case 'skipped': return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'undone': return <Undo2 className="h-3.5 w-3.5 text-amber-500" />;
    default: return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const PlanCard: React.FC<Props> = ({ plan, onApprove, onCancel, onUndo }) => {
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState<Record<number, boolean>>(
    Object.fromEntries(plan.steps.map(s => [s.index, s.enabled !== false]))
  );
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const isProposed = plan.status === 'proposed';
  const isRunning = plan.status === 'running';
  const isDone = plan.status === 'done' || plan.status === 'failed';
  const canUndo = (plan.status === 'done' || plan.status === 'failed') && plan.hasWrites;

  const approve = () => {
    const indices = plan.steps.filter(s => enabled[s.index] !== false).map(s => s.index);
    if (indices.length === 0) return;
    setEditing(false);
    onApprove(plan.planId, indices);
  };

  return (
    <div className={cn(
      'rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden',
      'shadow-sm'
    )}>
      <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="h-3 w-3 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">{plan.title}</div>
            <div className="text-[10px] text-muted-foreground">
              {plan.steps.length} step{plan.steps.length === 1 ? '' : 's'} ·{' '}
              {isProposed && 'Awaiting approval'}
              {isRunning && 'Running…'}
              {plan.status === 'done' && 'Completed'}
              {plan.status === 'failed' && 'Failed'}
              {plan.status === 'cancelled' && 'Cancelled'}
              {plan.status === 'undone' && 'Undone'}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {plan.steps.map(step => {
          const isOff = enabled[step.index] === false;
          const open = expanded[step.index];
          return (
            <div key={step.index} className={cn('px-3 py-2', isOff && 'opacity-40')}>
              <div className="flex items-start gap-2">
                {editing && isProposed ? (
                  <input
                    type="checkbox"
                    checked={!isOff}
                    onChange={e => setEnabled(p => ({ ...p, [step.index]: e.target.checked }))}
                    className="mt-0.5 h-3.5 w-3.5 accent-primary"
                  />
                ) : (
                  <div className="mt-0.5">{statusIcon(step.status)}</div>
                )}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [step.index]: !p[step.index] }))}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {String(step.index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-foreground line-clamp-2">{step.summary}</span>
                    {open
                      ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {step.tool}
                  </div>
                </button>
              </div>
              {open && (
                <pre className="mt-1.5 ml-6 p-2 rounded bg-muted/40 text-[10px] text-muted-foreground overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {JSON.stringify(step.args, null, 2)}
                  {step.error && <span className="block text-destructive mt-1">Error: {step.error}</span>}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-border/60 bg-card/60 flex items-center justify-end gap-1.5">
        {isProposed && (
          <>
            <button
              onClick={() => setEditing(e => !e)}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" /> {editing ? 'Done' : 'Edit'}
            </button>
            <button
              onClick={() => onCancel(plan.planId)}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Ban className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={approve}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="h-3 w-3" /> Approve & run
            </button>
          </>
        )}
        {isDone && canUndo && (
          <button
            onClick={() => onUndo(plan.planId)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
