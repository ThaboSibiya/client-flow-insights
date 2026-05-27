import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  X,
  Check
} from 'lucide-react';
import { useOnboardingWizard, WizardStep } from '@/hooks/useOnboardingWizard';
import TemplateSelectionStep from '../modern/steps/TemplateSelectionStep';
import BasicInfoStep from '../modern/steps/BasicInfoStep';
import TemplateFieldsStep from '../modern/steps/TemplateFieldsStep';
import ReviewStep from '../modern/steps/ReviewStep';
import { cn } from '@/lib/utils';

interface MobileOnboardingWizardProps {
  onBack: () => void;
}

const STEP_LABELS: Record<WizardStep, string> = {
  template: 'Template',
  basic: 'Info',
  fields: 'Details',
  review: 'Review',
};

const MobileOnboardingWizard: React.FC<MobileOnboardingWizardProps> = ({ onBack }) => {
  const {
    currentStep,
    stepIndex,
    steps,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    selectedTemplate,
    selectTemplate,
    templateFields,
    fieldsLoading,
    customerData,
    updateCustomerData,
    customFieldValues,
    updateCustomFieldValue,
    isSubmitting,
    submitCustomer,
  } = useOnboardingWizard();

  // Filter steps for display
  const visibleSteps = selectedTemplate ? steps : steps.filter(s => s !== 'fields');
  const currentVisibleIndex = visibleSteps.indexOf(currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'template':
        return (
          <TemplateSelectionStep
            selectedTemplate={selectedTemplate}
            onSelectTemplate={selectTemplate}
            fieldsLoading={fieldsLoading}
          />
        );
      case 'basic':
        return (
          <BasicInfoStep
            customerData={customerData}
            onUpdateField={updateCustomerData}
          />
        );
      case 'fields':
        if (!selectedTemplate) return null;
        return (
          <TemplateFieldsStep
            template={selectedTemplate}
            fields={templateFields}
            values={customFieldValues}
            onUpdateField={updateCustomFieldValue}
            isLoading={fieldsLoading}
          />
        );
      case 'review':
        return (
          <ReviewStep
            customerData={customerData}
            template={selectedTemplate}
            templateFields={templateFields}
            customFieldValues={customFieldValues}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-quikle-silver/20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-quikle-slate active:bg-quikle-crystal rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-medium text-quikle-charcoal">
            Add Customer
          </span>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {visibleSteps.map((step, index) => (
            <div 
              key={step}
              className="flex-1 flex flex-col items-center"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all",
                index < currentVisibleIndex && "bg-green-500 text-white",
                index === currentVisibleIndex && "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white shadow-md",
                index > currentVisibleIndex && "bg-quikle-silver/30 text-quikle-slate"
              )}>
                {index < currentVisibleIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                "text-xs",
                index === currentVisibleIndex ? "text-quikle-primary font-medium" : "text-quikle-slate"
              )}>
                {STEP_LABELS[step]}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-quikle-silver/20 rounded-full overflow-hidden mt-3">
          <div 
            className="h-full bg-gradient-to-r from-quikle-primary to-quikle-secondary transition-all duration-500"
            style={{ width: `${((currentVisibleIndex + 1) / visibleSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderStep()}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-quikle-silver/20 px-4 py-4 safe-area-bottom">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={!canGoPrev}
            className="flex-1 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={submitCustomer}
              disabled={isSubmitting}
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Add Customer
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canGoNext || fieldsLoading}
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileOnboardingWizard;
