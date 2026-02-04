import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import StepIndicator from './StepIndicator';
import TemplateSelectionStep from './steps/TemplateSelectionStep';
import BasicInfoStep from './steps/BasicInfoStep';
import TemplateFieldsStep from './steps/TemplateFieldsStep';
import ReviewStep from './steps/ReviewStep';

interface OnboardingWizardProps {
  onBack: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onBack }) => {
  const {
    currentStep,
    stepIndex,
    steps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    progress,
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
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-quikle-slate hover:text-quikle-charcoal"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <div className="flex-1">
          <StepIndicator
            currentStep={currentStep}
            steps={steps}
            stepIndex={stepIndex}
            hasTemplate={!!selectedTemplate}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-quikle-silver/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-quikle-primary to-quikle-secondary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <Card className="border-quikle-silver/30 shadow-lg bg-gradient-to-br from-white via-quikle-crystal/30 to-quikle-platinum/30">
        <CardContent className="p-6 md:p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={!canGoPrev}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-sm text-quikle-slate">
          Step {stepIndex + 1} of {selectedTemplate ? steps.length : steps.length - 1}
        </div>

        {currentStep === 'review' ? (
          <Button
            onClick={submitCustomer}
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-lg"
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
            className="gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-lg"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
