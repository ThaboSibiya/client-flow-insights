
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Receipt, AlertCircle, CheckCircle2, Crown, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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
    // Check multiple signals for South African locale
    const sources = [
      Intl.DateTimeFormat().resolvedOptions().locale,
      navigator.language,
      ...(navigator.languages || []),
    ].filter(Boolean);

    const isSouthAfrican = sources.some((lang) =>
      lang.toLowerCase().includes('za')
    );
    if (isSouthAfrican) return 'ZAR';

    // Fallback: check timezone
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
  const currentPlanName = 'Solo'; // Mock — would come from billing integration

  const paymentMethod = {
    type: 'Visa',
    last4: '4242',
    expiry: '12/25',
  };

  const invoices = [
    { id: 'INV-001', date: '2024-01-01', amount: 99.0, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 99.0, status: 'paid' },
    { id: 'INV-003', date: '2023-11-01', amount: 99.0, status: 'paid' },
  ];

  const formatAmount = (amount: number) =>
    currency === 'ZAR' ? `R${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-8">
      {/* Plans Header */}
      <div>
        <h2 className="text-xl font-semibold text-quikle-charcoal">Choose Your Plan</h2>
        <p className="text-sm text-quikle-slate mt-1">
          Simple, transparent pricing. Currency auto-detected as <Badge variant="outline" className="ml-1 text-xs">{currency}</Badge>
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === currentPlanName;
          const priceInfo = plan.price[currency];
          const allFeatures = [plan.users, plan.customers, plan.storage, plan.webhooks, plan.support, ...plan.features];

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? 'border-quikle-primary/40 shadow-luxury ring-1 ring-quikle-primary/20 scale-[1.02]'
                  : ''
              } ${isCurrent ? 'border-green-400/50 ring-1 ring-green-400/30' : ''}`}
            >
              {/* Badges */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                {plan.badge && (
                  <Badge className="bg-quikle-primary text-white shadow-md text-xs px-3">
                    {plan.badge}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="bg-green-600 text-white shadow-md text-xs px-3">
                    Current Plan
                  </Badge>
                )}
              </div>

              <CardHeader className="text-center pt-8 pb-4 border-b-0">
                <div className="mx-auto mb-2 p-2.5 rounded-xl bg-quikle-platinum text-quikle-primary w-fit">
                  {plan.icon}
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-quikle-charcoal">{priceInfo.label}</span>
                  <span className="text-sm text-quikle-slate/70">/mo</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col pt-4">
                <ul className="space-y-2.5 flex-1">
                  {allFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${i < 5 ? 'text-green-500' : 'text-quikle-slate/50'}`} />
                      <span className={i < 5 ? 'font-medium text-quikle-charcoal' : 'text-quikle-slate'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6"
                  variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'secondary'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-quikle-primary" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-quikle-crystal/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <CreditCard className="h-5 w-5 text-quikle-primary" />
              </div>
              <div>
                <p className="font-medium">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                <p className="text-sm text-quikle-slate/70">Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Add New</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-quikle-primary" />
            Billing History
          </CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 hover:bg-quikle-crystal/30 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-quikle-slate/60" />
                  <div>
                    <p className="font-medium text-sm">{invoice.id}</p>
                    <p className="text-xs text-quikle-slate/70">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatAmount(invoice.amount)}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Cancel Subscription
          </CardTitle>
          <CardDescription>Cancel your subscription and downgrade to free</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Cancel Subscription</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;
