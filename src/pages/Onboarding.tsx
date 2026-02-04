import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { OnboardingMode } from '@/hooks/useOnboardingWizard';

// Modern components
import { OnboardingWizard, OnboardingEntrySelector } from '@/components/onboarding/modern';
import { ModernBulkImport } from '@/components/onboarding/bulk';
import { MobileOnboardingWizard, MobileEntrySelector } from '@/components/onboarding/mobile';
import CustomTemplateManager from '@/components/templates/CustomTemplateManager';

interface OnboardingProps {}

const Onboarding: React.FC<OnboardingProps> = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<OnboardingMode>('select');

  const handleSelectMode = (selectedMode: OnboardingMode) => {
    setMode(selectedMode);
  };

  const handleBack = () => {
    setMode('select');
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <Alert className="bg-gradient-to-r from-quikle-crystal to-quikle-platinum border-quikle-neutral/30 text-quikle-charcoal shadow-platinum">
          <Info className="h-4 w-4 text-quikle-neutral" />
          <AlertTitle className="text-quikle-neutral font-semibold">Authentication required</AlertTitle>
          <AlertDescription className="text-quikle-slate">
            You need to be logged in to add customers to the system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-quikle-crystal/30">
        {mode === 'select' && (
          <MobileEntrySelector onSelectMode={handleSelectMode} />
        )}
        
        {mode === 'individual' && (
          <MobileOnboardingWizard onBack={handleBack} />
        )}
        
        {mode === 'bulk' && (
          <div className="p-4">
            <ModernBulkImport onBack={handleBack} />
          </div>
        )}
        
        {mode === 'template' && (
          <div className="p-4">
            <CustomTemplateManager />
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-6 p-6">
      {mode === 'select' && (
        <OnboardingEntrySelector onSelectMode={handleSelectMode} />
      )}
      
      {mode === 'individual' && (
        <OnboardingWizard onBack={handleBack} />
      )}
      
      {mode === 'bulk' && (
        <ModernBulkImport onBack={handleBack} />
      )}
      
      {mode === 'template' && (
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="text-sm text-quikle-slate hover:text-quikle-charcoal flex items-center gap-1"
          >
            ← Back to onboarding
          </button>
          <CustomTemplateManager />
        </div>
      )}
    </div>
  );
};

export default Onboarding;
