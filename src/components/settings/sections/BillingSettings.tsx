import React, { useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Receipt, AlertCircle, Crown, Sparkles, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import PlanCard from '@/components/billing/PlanCard';
import PaymentVerification from '@/components/billing/PaymentVerification';
import CancellationPolicySummary from '@/components/billing/CancellationPolicySummary';
import CancelSubscriptionDialog from '@/components/billing/CancelSubscriptionDialog';

type Currency = 'ZAR' | 'USD';

interface PlanTier {
  name: string;
  icon: React.ReactNode;
  price: Record<Currency, { amount: number; label: string }>;
  badge?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  users: string;
  customers: string;
  storage: string;
  webhooks: string;
  support: string;
}

const PLANS: PlanTier[] = [
  {
    name: 'Solo',
    icon: <Crown className="h-5 w-5" />,
    price: {
      ZAR: { amount: 99, label: 'R99' },
      USD: { amount: 6, label: '$6' },
    },
    users: '1 user',
    customers: '500 customers',
    storage: '2 GB storage',
    webhooks: '3 API webhooks',
    support: 'Email support',
    features: ['Basic automations', 'Standard reports', 'Mobile access'],
    cta: 'Get Started',
  },
  {
    name: 'Team',
    icon: <Sparkles className="h-5 w-5" />,
    price: {
      ZAR: { amount: 499, label: 'R499' },
      USD: { amount: 29, label: '$29' },
    },
    badge: 'Most Popular',
    highlighted: true,
    users: 'Up to 10 users',
    customers: '2,000 customers',
    storage: '10 GB storage',
    webhooks: '10 API webhooks',
    support: 'Priority support',
    features: ['Advanced automations', 'Team collaboration', 'Analytics dashboard'],
    cta: 'Upgrade to Team',
  },
  {
    name: 'Enterprise',
    icon: <Building2 className="h-5 w-5" />,
    price: {
      ZAR: { amount: 999, label: 'From R999' },
      USD: { amount: 59, label: 'From $59' },
    },
    users: 'Unlimited users',
    customers: 'Unlimited customers',
    storage: '50 GB+ storage',
    webhooks: 'Unlimited webhooks',
    support: 'Dedicated support',
    features: ['Full automation suite', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales',
  },
];

const detectCurrency = (): Currency => {
  try {
    const sources = [
      Intl.DateTimeFormat().resolvedOptions().locale,
      navigator.language,
      ...(navigator.languages || []),
    ].filter(Boolean);

    const isSouthAfrican = sources.some((lang) =>
      lang.toLowerCase().includes('za')
    );
    if (isSouthAfrican) return 'ZAR';

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timezone.toLowerCase().includes('johannesburg') || timezone.toLowerCase().includes('africa/johannesburg')) {
      return 'ZAR';
    }
  } catch {
    // fallback
  }
  return 'USD';
};

const BillingSettings = () => {
  const currency = useMemo(detectCurrency, []);
  const {
    subscription,
    isLoading,
    currentPlan,
    isActive,
    isPastDue,
    initializePayment,
    cancelSubscription,
  } = useSubscription();

  const handleSelectPlan = (plan: PlanTier) => {
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
    <div className="space-y-8">
      {/* Payment Verification Banner */}
      <PaymentVerification />

      {/* Current Status */}
      {isActive && subscription && (
        <Card className="border-green-300/50 bg-green-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Active {subscription.plan_name} Plan
              </p>
              <p className="text-sm text-green-600">
                {subscription.current_period_end
                  ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'Subscription active'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPastDue && (
        <Card className="border-orange-300/50 bg-orange-50/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Payment Past Due</p>
              <p className="text-sm text-orange-600">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Header */}
      <div>
        <h2 className="text-xl font-semibold text-quikle-charcoal">Choose Your Plan</h2>
        <p className="text-sm text-quikle-slate mt-1">
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
              icon={plan.icon}
              priceLabel={priceInfo.label}
              priceAmount={priceInfo.amount}
              currency={currency}
              badge={plan.badge}
              highlighted={plan.highlighted}
              isCurrent={isCurrent}
              isLoading={initializePayment.isPending}
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
          <Shield className="h-5 w-5 text-quikle-primary" />
          <div>
            <p className="font-medium text-sm">Secure Payments by Paystack</p>
            <p className="text-xs text-quikle-slate">
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

      {/* Cancellation Policy & Cancel */}
      {isActive && (
        <>
          <CancellationPolicySummary />
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
        </>
      )}
    </div>
  );
};

export default BillingSettings;
