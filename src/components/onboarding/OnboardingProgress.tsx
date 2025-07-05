import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: 'company' | 'customer' | 'complete';
  steps: Array<{
    key: string;
    title: string;
    description: string;
  }>;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, steps }) => {
  const getStepIndex = (step: string) => {
    return steps.findIndex(s => s.key === step);
  };

  const currentIndex = getStepIndex(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-quikle-slate">Setup Progress</h2>
        <span className="text-sm font-medium text-quikle-primary">
          {currentIndex + 1} of {steps.length}
        </span>
      </div>
      
      <Progress value={progress} className="mb-6" />
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2
                  ${isCompleted ? 'bg-quikle-primary border-quikle-primary text-white' : 
                    isCurrent ? 'border-quikle-primary text-quikle-primary' : 
                    'border-quikle-silver text-quikle-slate'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <div className="text-center max-w-24">
                  <p className={`text-xs font-medium mb-1 ${
                    isCurrent ? 'text-quikle-primary' : 'text-quikle-slate'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-quikle-slate leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-quikle-silver mx-2 mt-4" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;