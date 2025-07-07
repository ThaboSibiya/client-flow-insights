
import React from 'react';
import CustomerFormStep from './CustomerFormStep';

interface IndustrySpecificOnboardingProps {
  industry: string;
  onComplete: () => void;
  onBack: () => void;
}

const IndustrySpecificOnboarding: React.FC<IndustrySpecificOnboardingProps> = ({
  industry,
  onComplete,
  onBack,
}) => {
  return (
    <CustomerFormStep
      industry={industry}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
};

export default IndustrySpecificOnboarding;
