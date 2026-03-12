import React from 'react';
import { Check, User, Ticket, Wrench, Camera, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface JobCompletionStepperProps {
  steps: Step[];
}

export const JobCompletionStepper = ({ steps }: JobCompletionStepperProps) => {
  return (
    <div className="flex items-center gap-1 px-1">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
                step.completed
                  ? 'bg-primary text-primary-foreground'
                  : step.active
                    ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {step.completed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className="[&>svg]:h-3 [&>svg]:w-3">{step.icon}</span>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium text-center leading-tight truncate w-full',
                step.active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 min-w-3 rounded-full mt-[-14px]',
                step.completed ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const getStepDefinitions = () => [
  { id: 'customer', label: 'Client', icon: <User /> },
  { id: 'ticket', label: 'Ticket', icon: <Ticket /> },
  { id: 'work', label: 'Work', icon: <Wrench /> },
  { id: 'photos', label: 'Photos', icon: <Camera /> },
  { id: 'review', label: 'Review', icon: <ClipboardCheck /> },
];
