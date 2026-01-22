import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import ProfileCompletionStep from './ProfileCompletionStep';
import ProfileCompletionMilestone from './ProfileCompletionMilestone';
import ProfileCompletionConfetti from './ProfileCompletionConfetti';
import { 
  User, 
  Trophy,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EnhancedProfileCompletionTracker: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    profile,
    loading, 
    completionPercentage, 
    completionSteps,
    incompleteSteps, 
    isComplete,
    refetch
  } = useProfileCompletion();

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousPercentage, setPreviousPercentage] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);

  // Track percentage changes for celebrations
  useEffect(() => {
    if (completionPercentage > previousPercentage) {
      // Check if we crossed a milestone
      const milestones = [25, 50, 75, 100];
      const crossedMilestone = milestones.find(
        m => previousPercentage < m && completionPercentage >= m
      );
      
      if (crossedMilestone) {
        setShowMilestoneAnimation(true);
        setTimeout(() => setShowMilestoneAnimation(false), 2000);
        
        if (crossedMilestone === 100) {
          setShowConfetti(true);
        }
      }
    }
    setPreviousPercentage(completionPercentage);
  }, [completionPercentage, previousPercentage]);

  const handleInlineSave = useCallback(async (field: string, value: string) => {
    if (!user) return;

    try {
      // Handle special case for 'name' field
      if (field === 'name') {
        const parts = value.trim().split(/\s+/);
        const first_name = parts[0] || '';
        const last_name = parts.slice(1).join(' ') || '';
        
        const { error } = await supabase
          .from('profiles')
          .update({ first_name, last_name })
          .eq('id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ [field]: value })
          .eq('id', user.id);
        
        if (error) throw error;
      }

      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved.',
      });

      // Refetch profile data instead of full page reload
      await refetch();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, refetch]);

  const getFieldValue = (field: string): string => {
    if (!profile) return '';
    if (field === 'name') {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return (profile as any)[field] || '';
  };

  if (loading) {
    return (
      <Card className="shadow-luxury glass-effect border-quikle-silver/20">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-quikle-silver/20 rounded w-1/2" />
            <div className="h-2 bg-quikle-silver/20 rounded" />
            <div className="space-y-2">
              <div className="h-12 bg-quikle-silver/20 rounded" />
              <div className="h-12 bg-quikle-silver/20 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <>
        <ProfileCompletionConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <Card className={cn(
          "shadow-luxury glass-effect border-quikle-silver/20 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden",
          showMilestoneAnimation && "animate-celebrate-pulse"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                  Profile Complete! 
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </p>
                <p className="text-xs text-green-600">You're all set up and ready to go</p>
              </div>
              <Badge className="bg-green-500 text-white border-0">100%</Badge>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <ProfileCompletionConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Card className={cn(
        "shadow-luxury glass-effect border-quikle-silver/20 overflow-hidden transition-all duration-300",
        showMilestoneAnimation && "ring-2 ring-quikle-primary/30 animate-celebrate-pulse"
      )}>
        {/* Header */}
        <CardHeader className="pb-2 pt-3 px-4 border-b border-quikle-silver/20 bg-gradient-to-r from-quikle-primary/5 to-quikle-secondary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-quikle-charcoal flex items-center gap-2">
              <User className="h-4 w-4 text-quikle-primary" />
              Complete Your Profile
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs transition-all",
                  completionPercentage >= 80 ? "bg-green-100 text-green-700 border-green-200" :
                  completionPercentage >= 50 ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-red-100 text-red-700 border-red-200"
                )}
              >
                {completionPercentage}%
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn(
          "transition-all duration-300 overflow-hidden",
          isCollapsed ? "p-0 max-h-0" : "p-4 max-h-[600px]"
        )}>
          <div className="space-y-4">
            {/* Progress bar with animation */}
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-full">
                <Progress 
                  value={completionPercentage} 
                  className="h-2.5"
                />
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              </div>
              
              {/* Milestone badges */}
              <ProfileCompletionMilestone 
                percentage={completionPercentage} 
                showAnimation={showMilestoneAnimation}
              />
            </div>

            {/* Steps */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {completionSteps.map((step, index) => (
                <ProfileCompletionStep
                  key={step.id}
                  step={step}
                  index={index}
                  isExpanded={expandedStep === step.id}
                  onToggle={() => setExpandedStep(
                    expandedStep === step.id ? null : step.id
                  )}
                  onSave={handleInlineSave}
                  currentValue={getFieldValue(step.field)}
                />
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 pt-2 border-t border-quikle-silver/20">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs border-quikle-primary/30 text-quikle-primary hover:bg-quikle-primary hover:text-white transition-all group"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-3 w-3 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                Open Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default EnhancedProfileCompletionTracker;
