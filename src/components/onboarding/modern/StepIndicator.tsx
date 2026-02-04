import React from 'react';
import { cn } from '@/lib/utils';
import { Check, FileText, User, Settings, ClipboardCheck } from 'lucide-react';
import { WizardStep } from '@/hooks/useOnboardingWizard';

interface StepIndicatorProps {
  currentStep: WizardStep;
  steps: WizardStep[];
  stepIndex: number;
  hasTemplate: boolean;
  onStepClick?: (step: WizardStep) => void;
}

const STEP_CONFIG: Record<WizardStep, { label: string; icon: React.ElementType }> = {
  template: { label: 'Template', icon: FileText },
  basic: { label: 'Basic Info', icon: User },
  fields: { label: 'Details', icon: Settings },
  review: { label: 'Review', icon: ClipboardCheck },
};

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
  stepIndex,
  hasTemplate,
  onStepClick,
}) => {
  // Filter out fields step if no template
  const visibleSteps = hasTemplate ? steps : steps.filter(s => s !== 'fields');
  const currentVisibleIndex = visibleSteps.indexOf(currentStep);

  return (
    <div className="w-full">
      {/* Desktop Step Indicator */}
      <div className="hidden md:flex items-center justify-center gap-2">
        {visibleSteps.map((step, index) => {
          const config = STEP_CONFIG[step];
          const Icon = config.icon;
          const isActive = step === currentStep;
          const isCompleted = index < currentVisibleIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <React.Fragment key={step}>
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                  isActive && "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white shadow-lg scale-105",
                  isCompleted && "bg-green-100 text-green-700 hover:bg-green-200",
                  !isActive && !isCompleted && "bg-quikle-silver/20 text-quikle-slate",
                  isClickable && "cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isActive && "bg-white/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-quikle-silver/40"
                )}>
                  {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <span className="font-medium text-sm">{config.label}</span>
              </button>
              
              {index < visibleSteps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 transition-colors duration-300",
                  index < currentVisibleIndex ? "bg-green-400" : "bg-quikle-silver/30"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-quikle-charcoal">
            Step {currentVisibleIndex + 1} of {visibleSteps.length}
          </span>
          <span className="text-sm text-quikle-slate">
            {STEP_CONFIG[currentStep].label}
          </span>
        </div>
        <div className="flex gap-1">
          {visibleSteps.map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                index < currentVisibleIndex && "bg-green-400",
                index === currentVisibleIndex && "bg-gradient-to-r from-quikle-primary to-quikle-secondary",
                index > currentVisibleIndex && "bg-quikle-silver/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
