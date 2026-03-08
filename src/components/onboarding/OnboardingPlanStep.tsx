import React, { useMemo } from 'react';
import { Crown, Sparkles, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLANS, detectCurrency, type PlanTier, type Currency } from '@/components/billing/plans-data';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  Crown: <Crown className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
};

interface OnboardingPlanStepProps {
  onSkip: () => void;
}

const OnboardingPlanStep: React.FC<OnboardingPlanStepProps> = ({ onSkip }) => {
  const currency = useMemo(detectCurrency, []);
  const { initializePayment, isActive, currentPlan } = useSubscription();

  const handleSelect = (plan: PlanTier) => {
    if (plan.name === 'Enterprise') {
      window.open('mailto:sales@quikle.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    const priceInfo = plan.price[currency];
    initializePayment.mutate({
      planName: plan.name,
      amount: priceInfo.amount,
      currency,
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Pick a plan that fits your needs. You can always change later.
        </p>
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
                isCurrent && 'border-green-400/50 ring-1 ring-green-400/30'
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
                disabled={isCurrent || initializePayment.isPending}
                onClick={() => handleSelect(plan)}
              >
                {initializePayment.isPending ? (
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

      <button
        onClick={onSkip}
        className="block mx-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
      >
        Skip — start free
      </button>
    </div>
  );
};

export default OnboardingPlanStep;
