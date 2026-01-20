import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useTour } from './FeatureTour';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TourTriggerProps {
  tourId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

const TourTrigger: React.FC<TourTriggerProps> = ({ 
  tourId, 
  variant = 'icon',
  className 
}) => {
  const { startTour, isActive } = useTour();

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => startTour(tourId)}
        disabled={isActive}
        className={className}
      >
        <Sparkles className="h-4 w-4 mr-2 text-quikle-primary" />
        Take a Tour
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startTour(tourId)}
          disabled={isActive}
          className={className}
        >
          <HelpCircle className="h-5 w-5 text-quikle-slate hover:text-quikle-primary transition-colors" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Take a guided tour</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TourTrigger;
