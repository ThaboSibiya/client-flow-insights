import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Crown, Sparkles, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';
import { useWorkspace } from '@/context/WorkspaceContext';
import PlanCard from '@/components/billing/PlanCard';
import PaymentVerification from '@/components/billing/PaymentVerification';
import CancellationPolicySummary from '@/components/billing/CancellationPolicySummary';
import CancelSubscriptionDialog from '@/components/billing/CancelSubscriptionDialog';
import { PLANS, detectCurrency, type PlanTier, type Currency } from '@/components/billing/plans-data';

const ICON_MAP: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
};

const BillingSettings = () => {
  const currency = useMemo(detectCurrency, []);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const { activeWorkspace } = useWorkspace();
  const {
    subscription,
    isLoading,
    currentPlan,
    isActive,
    isPastDue,
    initializePayment,
    cancelSubscription,
  } = useWorkspaceSubscription();

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan.name === 'Enterprise') {
      window.open('mailto:lance@quikle.co.za?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    setSelectedPlan(plan.name);
    const priceInfo = plan.price[currency];
    initializePayment.mutate(
      { planName: plan.name, amount: priceInfo.amount, currency },
      { onSettled: () => setSelectedPlan(null) },
    );
  };

  return (
    <div className="space-y-8">
      {/* Payment Verification Banner */}
      <PaymentVerification />

      {/* Active Workspace Context */}
      {activeWorkspace && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Billing for: {activeWorkspace.name}
          </Badge>
        </div>
      )}

      {/* Current Status */}
      {isActive && subscription && (
        <Card className="border-green-300/50 bg-green-50/30 dark:border-green-700/30 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                Active {subscription.plan_name} Plan
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {subscription.current_period_end
                  ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'Subscription active'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPastDue && (
        <Card className="border-orange-300/50 bg-orange-50/30 dark:border-orange-700/30 dark:bg-orange-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">Payment Past Due</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Choose Your Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Simple, transparent pricing. Currency auto-detected as{' '}
          <Badge variant="outline" className="ml-1 text-xs">{currency}</Badge>
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === currentPlan && isActive;
          const priceInfo = plan.price[currency];
          const allFeatures = [
            plan.users, plan.customers, plan.storage,
            plan.webhooks, plan.support, ...plan.features,
          ];

          return (
            <PlanCard
              key={plan.name}
              name={plan.name}
              icon={ICON_MAP[plan.iconName]}
              priceLabel={priceInfo.label}
              priceAmount={priceInfo.amount}
              currency={currency}
              badge={plan.badge}
              highlighted={plan.highlighted}
              isCurrent={isCurrent}
              isLoading={initializePayment.isPending && selectedPlan === plan.name}
              features={allFeatures}
              cta={plan.cta}
              onSelect={() => handleSelectPlan(plan)}
            />
          );
        })}
      </div>

      <Separator />

      {/* Secure Payment Notice */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-sm">Secure Payments by Paystack</p>
            <p className="text-xs text-muted-foreground">
              All payments are processed securely through Paystack. Your card details are never stored on our servers.
            </p>
          </div>
          <img 
            src="https://paystack.com/assets/img/logos/paystack-logo.svg" 
            alt="Paystack" 
            className="h-6 ml-auto opacity-60"
            loading="lazy"
          />
        </CardContent>
      </Card>

      {/* Cancellation Policy Summary — always visible */}
      <CancellationPolicySummary />

      {/* Cancel Subscription — only for active subscribers */}
      {isActive && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Cancel Subscription
            </CardTitle>
            <CardDescription>Cancel your subscription and downgrade to free</CardDescription>
          </CardHeader>
          <CardContent>
            <CancelSubscriptionDialog
              isPending={cancelSubscription.isPending}
              onConfirm={() => cancelSubscription.mutate()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingSettings;
