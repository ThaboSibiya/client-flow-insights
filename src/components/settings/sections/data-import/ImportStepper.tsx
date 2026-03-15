import React from 'react';
import { Check } from 'lucide-react';
import { ImportStep } from './types';

const STEPS = [
  { key: 'select', label: 'Data Type' },
  { key: 'upload', label: 'Upload' },
  { key: 'map', label: 'Map Fields' },
  { key: 'preview', label: 'Preview' },
  { key: 'done', label: 'Complete' },
] as const;

const STEP_ORDER: ImportStep[] = ['select', 'upload', 'map', 'preview', 'importing', 'done'];

interface ImportStepperProps {
  currentStep: ImportStep;
}

const ImportStepper = ({ currentStep }: ImportStepperProps) => {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const stepIdx = STEP_ORDER.indexOf(s.key as ImportStep);
        const isActive = currentStep === s.key || (s.key === 'done' && currentStep === 'importing');
        const isCompleted = currentIdx > stepIdx;

        return (
          <React.Fragment key={s.key}>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : isCompleted
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="w-4 text-center">{i + 1}</span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 transition-colors ${isCompleted ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ImportStepper;
