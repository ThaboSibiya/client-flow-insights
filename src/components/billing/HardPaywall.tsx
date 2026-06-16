import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLANS, detectCurrency, type PlanTier } from '@/components/billing/plans-data';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, string> = {
  Crown: '👑',
  Sparkles: '✨',
  Building2: '🏢',
};

const HardPaywall: React.FC = () => {
  const navigate = useNavigate();
  const currency = useMemo(detectCurrency, []);
  const { isTrialExpired, isActive, currentPlan, isLoading, workspaceId, initializePayment } =
    useWorkspaceSubscription();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

  // Show hard paywall only when trial has expired and no active paid plan
  const shouldShow = !isLoading && isTrialExpired && !isActive;

  const handleSelect = (plan: PlanTier) => {
    if (plan.name === 'Enterprise') {
      window.open('mailto:lance@quikle.co.za?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    if (!workspaceId) return;
    setSelectedPlan(plan.name);
    const priceInfo = plan.price[currency];
    initializePayment.mutate(
      { planName: plan.name, amount: priceInfo.amount, currency, workspaceId },
      { onSettled: () => setSelectedPlan(null) },
    );
  };

  if (!shouldShow) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button.absolute]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2 mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl text-center">
            Your Free Trial Has Ended
          </DialogTitle>
          <DialogDescription className="text-center">
            Your 14-day trial has expired. Choose a plan to continue using your workspace.
            All your data is safe and will be available once you subscribe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs">{currency}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((plan) => {
              const priceInfo = plan.price[currency];
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative rounded-lg border p-4 flex flex-col items-center text-center transition-all',
                    plan.highlighted
                      ? 'border-primary/40 shadow-md ring-1 ring-primary/20 scale-[1.02]'
                      : 'border-border',
                  )}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-2.5 bg-primary text-primary-foreground text-[10px] px-2">
                      {plan.badge}
                    </Badge>
                  )}

                  <div className="text-2xl mb-2">{ICON_MAP[plan.iconName]}</div>
                  <p className="font-semibold text-sm text-foreground">{plan.name}</p>

                  {priceInfo.label && (
                    <div className="my-2">
                      <span className="text-2xl font-bold text-foreground">{priceInfo.label}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                  )}

                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    <li className="flex items-center gap-1 justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {plan.users}
                    </li>
                    <li className="flex items-center gap-1 justify-center">
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {plan.customers}
                    </li>
                  </ul>

                  <Button
                    size="sm"
                    className="w-full text-xs"
                    variant={plan.highlighted ? 'default' : 'secondary'}
                    disabled={initializePayment.isPending && selectedPlan !== null}
                    onClick={() => handleSelect(plan)}
                  >
                    {initializePayment.isPending && selectedPlan === plan.name ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your data is preserved. Subscribe to regain full access immediately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HardPaywall;
