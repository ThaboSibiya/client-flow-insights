import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import CompanyOnboardingForm from '@/components/onboarding/CompanyOnboardingForm';
import IndustrySpecificOnboarding from '@/components/onboarding/IndustrySpecificOnboarding';
import OnboardingErrorBoundary from '@/components/onboarding/OnboardingErrorBoundary';
import { Loader2 } from 'lucide-react';

const CompanyOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading, currentStep, setCurrentStep, refreshProfile } = useOnboardingFlow();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Redirect if already onboarded
  React.useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center quikle-gradient-bg">
        <Loader2 className="h-8 w-8 animate-spin text-quikle-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCompanyComplete = async () => {
    await refreshProfile();
    setCurrentStep('customer');
  };

  const handleCustomerComplete = () => {
    navigate('/dashboard');
  };

  const handleBackToCompany = () => {
    setCurrentStep('company');
  };

  return (
    <OnboardingErrorBoundary onRetry={() => window.location.reload()}>
      {currentStep === 'company' && (
        <CompanyOnboardingForm onComplete={handleCompanyComplete} />
      )}
      
      {currentStep === 'customer' && profile?.industry && (
        <IndustrySpecificOnboarding
          industry={profile.industry}
          onComplete={handleCustomerComplete}
          onBack={handleBackToCompany}
        />
      )}
      
      {/* Fallback loading state */}
      {currentStep !== 'company' && currentStep !== 'customer' && (
        <div className="min-h-screen flex items-center justify-center quikle-gradient-bg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-quikle-primary mx-auto mb-4" />
            <p className="text-quikle-slate">Setting up your onboarding experience...</p>
          </div>
        </div>
      )}
    </OnboardingErrorBoundary>
  );
};

export default CompanyOnboarding;