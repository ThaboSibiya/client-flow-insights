import React from 'react';
import { Sparkles, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIAgentAccess } from '@/hooks/useAIAgentAccess';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EXAMPLES = [
  'Build a workflow that welcomes new leads with a 3-step email series',
  'Create an automation to notify me when an invoice is overdue 7+ days',
  'Audit my workflows and suggest improvements',
  'Review my welcome flow and tell me what to fix',
];

/**
 * Lightweight banner that nudges users toward the floating Quikle AI agent
 * for natural-language workflow creation. Clicking opens the agent and
 * pre-fills the prompt via a global custom event handled by the agent.
 */
const AIAgentBanner: React.FC = () => {
  const { canUseAgent, canCreateWorkflows, reason } = useAIAgentAccess();
  const disabled = !canUseAgent || !canCreateWorkflows;

  const openAgentWith = (prompt?: string) => {
    if (disabled) return;
    window.dispatchEvent(new CustomEvent('quikle-agent:open', { detail: { prompt } }));
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border/60',
          'bg-gradient-to-br from-primary/5 via-background to-background',
          'p-4 sm:p-5',
          disabled && 'opacity-75'
        )}
      >
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              'flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center shadow-sm',
              disabled
                ? 'bg-muted ring-1 ring-border'
                : 'bg-gradient-to-br from-primary to-primary/70 ring-1 ring-primary/30'
            )}>
              {disabled
                ? <Lock className="h-5 w-5 text-muted-foreground" />
                : <Sparkles className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Build with Quikle AI</h3>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 font-medium rounded-full',
                  disabled ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                )}>
                  {disabled ? 'Locked' : 'New'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {disabled
                  ? (reason ?? 'Your account does not have AI workflow access.')
                  : 'Describe a workflow in plain English, or ask Quikle AI to audit your existing ones and suggest improvements.'}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => openAgentWith('Audit my workflows and suggest improvements')}
                  aria-disabled={disabled}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full',
                    'bg-background text-foreground border border-border',
                    'transition-all',
                    disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted active:scale-[0.98]'
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Audit & Improve
                </button>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  {reason ?? 'Ask your administrator for AI Agent access.'}
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => openAgentWith()}
                  aria-disabled={disabled}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-full',
                    'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
                    'shadow-sm transition-all',
                    disabled
                      ? 'opacity-50 grayscale cursor-not-allowed'
                      : 'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  {disabled ? <Lock className="h-3.5 w-3.5" /> : null}
                  Open AI Builder
                  {!disabled && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              {disabled && (
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  {reason ?? 'Ask your administrator for AI Agent access.'}
                </TooltipContent>
              )}
            </Tooltip>
          </div>

        </div>

        <div className="relative mt-3 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 self-center mr-1">
            Try:
          </span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => openAgentWith(ex)}
              disabled={disabled}
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-full transition-colors',
                'bg-muted/60 text-foreground/80 border border-border/60',
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-muted hover:text-foreground hover:border-border'
              )}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIAgentBanner;
