import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface OnboardingStep {
  step: string;
  timestamp: string;
  industry?: string;
  timeSpent?: number;
}

interface OnboardingAnalytics {
  startTime: number;
  currentStep: string;
  completedSteps: OnboardingStep[];
  dropOffPoint?: string;
}

export const useOnboardingAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<OnboardingAnalytics>({
    startTime: Date.now(),
    currentStep: 'start',
    completedSteps: [],
  });

  const trackStep = async (step: string, additionalData?: Record<string, any>) => {
    if (!user) return;

    const now = Date.now();
    const timeSpent = now - analytics.startTime;

    const stepData: OnboardingStep = {
      step,
      timestamp: new Date().toISOString(),
      timeSpent,
      ...additionalData,
    };

    // Update local state
    setAnalytics(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: [...prev.completedSteps, stepData],
    }));

    // Log to console for development (you could integrate with external analytics services here)
    console.log('Onboarding step tracked:', { step, timeSpent: Math.round(timeSpent / 1000), additionalData });
  };

  const trackDropOff = async (step: string, reason?: string) => {
    if (!user) return;

    setAnalytics(prev => ({
      ...prev,
      dropOffPoint: step,
    }));

    // Log to console for development
    console.log('Onboarding drop-off tracked:', { 
      step, 
      reason: reason || 'unknown',
      timeSpent: Math.round((Date.now() - analytics.startTime) / 1000)
    });
  };

  const getCompletionRate = () => {
    const totalSteps = ['company', 'customer', 'complete'];
    if (totalSteps.length === 0) return 0;
    
    const completedSteps = analytics.completedSteps.filter(s => 
      totalSteps.includes(s.step)
    ).length;
    return (completedSteps / totalSteps.length) * 100;
  };

  const getAverageTimePerStep = () => {
    if (analytics.completedSteps.length === 0) return 0;
    const totalTime = analytics.completedSteps.reduce((sum, step) => 
      sum + (typeof step.timeSpent === 'number' ? step.timeSpent : 0), 0
    );
    return totalTime / analytics.completedSteps.length;
  };

  // Track page visibility to detect when users leave
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && analytics.currentStep !== 'complete') {
        trackDropOff(analytics.currentStep, 'page_hidden');
      }
    };

    const handleBeforeUnload = () => {
      if (analytics.currentStep !== 'complete') {
        trackDropOff(analytics.currentStep, 'page_unload');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [analytics.currentStep]);

  return {
    analytics,
    trackStep,
    trackDropOff,
    getCompletionRate,
    getAverageTimePerStep,
  };
};