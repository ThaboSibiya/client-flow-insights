import React from 'react';

export type Currency = 'ZAR' | 'USD';

export interface PlanTier {
  name: string;
  iconName: 'Crown' | 'Sparkles' | 'Building2';
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

export const PLANS: PlanTier[] = [
  {
    name: 'Solo',
    iconName: 'Crown',
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
    iconName: 'Sparkles',
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
    iconName: 'Building2',
    price: {
      ZAR: { amount: 999, label: '' },
      USD: { amount: 59, label: '' },
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

export const detectCurrency = (): Currency => {
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
