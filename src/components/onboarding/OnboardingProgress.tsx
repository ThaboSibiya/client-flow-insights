
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description?: string }[];
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-quikle-primary mb-2">
          Setup Progress
        </h2>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 bg-quikle-crystal rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-quikle-slate min-w-[3rem] text-right">
            {currentStep}/{totalSteps}
          </span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.title} className="flex items-start space-x-3 sm:space-x-4">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                isCompleted && "bg-quikle-primary border-quikle-primary text-white",
                isCurrent && "border-quikle-primary bg-white text-quikle-primary",
                isUpcoming && "border-quikle-silver bg-white text-quikle-slate"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0 pb-2">
                <h3 className={cn(
                  "text-sm sm:text-base font-medium leading-tight mb-1",
                  isCompleted && "text-quikle-primary",
                  isCurrent && "text-quikle-primary",
                  isUpcoming && "text-quikle-slate"
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={cn(
                    "text-xs sm:text-sm leading-relaxed",
                    isCompleted && "text-quikle-slate",
                    isCurrent && "text-quikle-charcoal",
                    isUpcoming && "text-quikle-neutral"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
