import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TourContextType {
  startTour: (tourId: string) => void;
  endTour: () => void;
  isActive: boolean;
  currentTourId: string | null;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="welcome-header"]',
    title: 'Welcome to Your Dashboard! 👋',
    content: 'This is your personalized command center. See your name and role at a glance.',
    position: 'bottom',
  },
  {
    target: '[data-tour="status-cards"]',
    title: 'Customer Overview',
    content: 'Track your customers by status. Click any card to filter and see details.',
    position: 'bottom',
  },
  {
    target: '[data-tour="activity-chart"]',
    title: 'Activity Analytics',
    content: 'Visualize your customer activity trends over time. Hover for details.',
    position: 'right',
  },
  {
    target: '[data-tour="profile-tracker"]',
    title: 'Complete Your Profile',
    content: 'Track your setup progress and complete important steps to unlock all features.',
    position: 'left',
  },
  {
    target: '[data-tour="workstation"]',
    title: 'Your Workstation',
    content: 'Your personal productivity hub. See tasks, projects, and quick stats.',
    position: 'left',
  },
  {
    target: '[data-tour="notification-bell"]',
    title: 'Stay Updated',
    content: 'Real-time notifications keep you informed about important updates.',
    position: 'bottom',
  },
];

const TOURS: Record<string, TourStep[]> = {
  dashboard: DASHBOARD_TOUR_STEPS,
};

interface TooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  targetRect: DOMRect | null;
}

const TourTooltip: React.FC<TooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  targetRect,
}) => {
  if (!targetRect) return null;

  const getPosition = () => {
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: Math.max(padding, targetRect.left - tooltipWidth - padding),
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.right + padding,
        };
      default:
        return {
          top: targetRect.bottom + padding,
          left: Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
        };
    }
  };

  const position = getPosition();

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Highlight box */}
      <div
        className="fixed z-[9999] rounded-lg ring-4 ring-quikle-primary ring-offset-4 ring-offset-transparent"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 bg-white rounded-xl shadow-luxury border border-quikle-silver/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 border-b border-quikle-silver/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-quikle-primary" />
            <Badge variant="outline" className="text-xs border-quikle-primary/30 text-quikle-primary">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-quikle-slate hover:text-quikle-charcoal"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <h4 className="font-semibold text-quikle-charcoal mb-1">{step.title}</h4>
          <p className="text-sm text-quikle-slate leading-relaxed">{step.content}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-quikle-crystal/30 border-t border-quikle-silver/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 0}
            className="text-quikle-slate"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep === totalSteps - 1 ? (
            <Button
              size="sm"
              onClick={onClose}
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete Tour
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onNext}
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = currentTourId ? TOURS[currentTourId] || [] : [];

  const updateTargetRect = useCallback(() => {
    if (!isActive || !steps[currentStep]) return;
    
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  const startTour = useCallback((tourId: string) => {
    if (!TOURS[tourId]) {
      console.warn(`Tour "${tourId}" not found`);
      return;
    }
    setCurrentTourId(tourId);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentTourId(null);
    setCurrentStep(0);
    setTargetRect(null);
    
    // Mark tour as completed
    if (user && currentTourId) {
      localStorage.setItem(`quikle_tour_${currentTourId}_${user.id}`, 'completed');
    }
  }, [user, currentTourId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <TourContext.Provider value={{ startTour, endTour, isActive, currentTourId }}>
      {children}
      {isActive && steps[currentStep] && (
        <TourTooltip
          step={steps[currentStep]}
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={endTour}
          targetRect={targetRect}
        />
      )}
    </TourContext.Provider>
  );
};

export default TourProvider;
