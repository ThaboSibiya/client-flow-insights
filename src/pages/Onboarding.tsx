
import React from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

const Onboarding = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Customer Onboarding</h1>
        <p className="text-muted-foreground mt-1">Add new customers to your CRM system</p>
      </div>
      <OnboardingForm />
    </div>
  );
};

export default Onboarding;
