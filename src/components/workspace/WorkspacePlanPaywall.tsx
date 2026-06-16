import React, { useMemo } from 'react';
import { Crown, Sparkles, Building2, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, detectCurrency, type PlanTier } from '@/components/billing/plans-data';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
};

interface WorkspacePlanPaywallProps {
  open: boolean;
  workspaceName: string;
  onSkip: () => void;
}

const WorkspacePlanPaywall: React.FC<WorkspacePlanPaywallProps> = ({
  open,
  workspaceName,
  onSkip,
}) => {
  const currency = useMemo(detectCurrency, []);
  const { activeWorkspace } = useWorkspace();
  const wsId = activeWorkspace?.id;
  const { initializePayment, isActive, currentPlan } = useWorkspaceSubscription(wsId || undefined);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  const handleSelect = (plan: PlanTier) => {
    if (plan.name === 'Enterprise') {
      window.open('mailto:lance@quikle.co.za?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    if (!wsId) return;
    setSelectedPlan(plan.name);
    const priceInfo = plan.price[currency];
    initializePayment.mutate(
      { planName: plan.name, amount: priceInfo.amount, currency, workspaceId: wsId },
      { onSettled: () => setSelectedPlan(null) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button.absolute]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 mx-auto">
            <Zap className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl text-center">
            Choose a plan for "{workspaceName}"
          </DialogTitle>
          <DialogDescription className="text-center">
            Each workspace is billed independently. Pick a plan to unlock features for this business.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs">{currency}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((plan) => {
              const isCurrent = plan.name === currentPlan && isActive;
              const priceInfo = plan.price[currency];
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative rounded-lg border p-4 flex flex-col items-center text-center transition-all',
                    plan.highlighted
                      ? 'border-primary/40 shadow-md ring-1 ring-primary/20 scale-[1.02]'
                      : 'border-border',
                    isCurrent && 'border-green-500/50 ring-1 ring-green-500/30',
                  )}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-2.5 bg-primary text-primary-foreground text-[10px] px-2">
                      {plan.badge}
                    </Badge>
                  )}

                  <div className="p-2 rounded-lg bg-muted text-primary mb-2">
                    {ICON_MAP[plan.iconName]}
                  </div>

                  <p className="font-semibold text-sm text-foreground">{plan.name}</p>

                  <div className="my-2">
                    <span className="text-2xl font-bold text-foreground">{priceInfo.label}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>

                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    <li className="flex items-center gap-1 justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {plan.users}
                    </li>
                    <li className="flex items-center gap-1 justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {plan.customers}
                    </li>
                    <li className="flex items-center gap-1 justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {plan.support}
                    </li>
                  </ul>

                  <Button
                    size="sm"
                    className="w-full text-xs"
                    variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'secondary'}
                    disabled={isCurrent || (initializePayment.isPending && selectedPlan !== null)}
                    onClick={() => handleSelect(plan)}
                  >
                    {initializePayment.isPending && selectedPlan === plan.name ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : isCurrent ? (
                      'Current'
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={onSkip}
            className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5"
          >
            Start 14-day free trial instead
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Full access for 14 days — no card required. After that, your workspace becomes read-only until you subscribe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspacePlanPaywall;
