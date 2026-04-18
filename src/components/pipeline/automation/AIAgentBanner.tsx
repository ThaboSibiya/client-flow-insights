import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLES = [
  'Welcome new leads with a 3-step email series',
  'Notify me when an invoice is overdue 7+ days',
  'Move tickets to In Progress when assigned',
  'Send a reminder 24h before a follow-up',
];

/**
 * Lightweight banner that nudges users toward the floating Quikle AI agent
 * for natural-language workflow creation. Clicking opens the agent and
 * pre-fills the prompt via a global custom event handled by the agent.
 */
const AIAgentBanner: React.FC = () => {
  const openAgentWith = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('quikle-agent:open', { detail: { prompt } }));
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60',
        'bg-gradient-to-br from-primary/5 via-background to-background',
        'p-4 sm:p-5'
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm ring-1 ring-primary/30">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Build with Quikle AI</h3>
              <span className="text-[10px] px-1.5 py-0.5 font-medium rounded-full bg-primary/10 text-primary">
                New
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Describe your workflow in plain English — Quikle AI will draft it for you.
            </p>
          </div>
        </div>

        <button
          onClick={() => openAgentWith()}
          className={cn(
            'flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-full',
            'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
            'shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all'
          )}
        >
          Open AI Builder
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Example prompts */}
      <div className="relative mt-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 self-center mr-1">
          Try:
        </span>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => openAgentWith(ex)}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full transition-colors',
              'bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground',
              'border border-border/60 hover:border-border'
            )}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIAgentBanner;
