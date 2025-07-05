import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, Users, TrendingUp } from 'lucide-react';

interface OnboardingOptimizerProps {
  currentStep: string;
  estimatedTimeRemaining: number;
  completionRate: number;
  onSkipRecommendation?: () => void;
}

const OnboardingOptimizer: React.FC<OnboardingOptimizerProps> = ({
  currentStep,
  estimatedTimeRemaining,
  completionRate,
  onSkipRecommendation,
}) => {
  const [showOptimization, setShowOptimization] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    // Show optimization suggestions after 3 minutes
    const optimizationTimer = setTimeout(() => {
      if (currentStep !== 'complete') {
        setShowOptimization(true);
      }
    }, 180000);

    return () => {
      clearInterval(timer);
      clearTimeout(optimizationTimer);
    };
  }, [currentStep]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOptimizationTips = () => {
    switch (currentStep) {
      case 'company':
        return [
          'Have your business registration details ready',
          'Prepare your company address and contact information',
          'Consider your industry classification carefully'
        ];
      case 'customer':
        return [
          'Start with your most important customer',
          'Have customer contact details accessible',
          'Include relevant notes for better service'
        ];
      default:
        return [];
    }
  };

  if (!showOptimization && timeSpent < 60) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 glass-effect shadow-luxury border-quikle-primary/30 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-quikle-primary" />
          <CardTitle className="text-sm font-semibold">Onboarding Assistant</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Speed up your setup with these tips
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-quikle-slate">
          <Clock className="h-3 w-3" />
          <span>Time spent: {formatTime(timeSpent)}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-quikle-slate">Progress</span>
            <span className="text-quikle-primary font-medium">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-1" />
        </div>

        {estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-2 text-xs text-quikle-slate">
            <TrendingUp className="h-3 w-3" />
            <span>~{Math.ceil(estimatedTimeRemaining / 60)} min remaining</span>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-quikle-charcoal">Quick Tips:</h4>
          <ul className="space-y-1">
            {getOptimizationTips().map((tip, index) => (
              <li key={index} className="text-xs text-quikle-slate flex items-start gap-1">
                <span className="text-quikle-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOptimization(false)}
            className="text-xs h-7 px-2"
          >
            Dismiss
          </Button>
          {onSkipRecommendation && (
            <Button
              size="sm"
              onClick={onSkipRecommendation}
              className="text-xs h-7 px-2 quikle-button-primary"
            >
              <Users className="h-3 w-3 mr-1" />
              Skip to Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingOptimizer;