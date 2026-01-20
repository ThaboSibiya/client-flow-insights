import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  LayoutDashboard, 
  FolderKanban,
  MessageCircle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}

const FirstTimeOnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const { employeeProfile, isCompanyOwner, loading } = useEmployeeAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const getUserFirstName = () => {
    if (employeeProfile?.first_name) return employeeProfile.first_name;
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Welcome to Quikle, ${getUserFirstName()}!`,
      description: isCompanyOwner 
        ? "As a company owner, you have full access to manage your team, clients, and business operations. Let's take a quick tour!"
        : `You've been added as a ${employeeProfile?.role || 'team member'}. Let's explore what you can do here!`,
      icon: <Sparkles className="h-12 w-12 text-amber-500" />,
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'Get a bird\'s eye view of your business metrics, recent activity, and quick actions all in one place.',
      icon: <LayoutDashboard className="h-12 w-12 text-quikle-primary" />,
      action: () => navigate('/dashboard'),
      actionLabel: 'Go to Dashboard'
    },
    {
      id: 'customers',
      title: 'Manage Customers',
      description: 'Keep track of all your clients, their details, communication history, and deals in one centralized location.',
      icon: <Users className="h-12 w-12 text-quikle-secondary" />,
      action: () => navigate('/customers'),
      actionLabel: 'View Customers'
    },
    {
      id: 'projects',
      title: 'Project Management',
      description: 'Organize your work with projects, tasks, and team collaboration. Track progress and meet deadlines.',
      icon: <FolderKanban className="h-12 w-12 text-quikle-accent" />,
      action: () => navigate('/projects'),
      actionLabel: 'View Projects'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You\'re ready to start using Quikle. Explore the platform and reach out if you need any help.',
      icon: <Rocket className="h-12 w-12 text-green-500" />,
    },
  ];

  // Check if user is first-time
  useEffect(() => {
    if (loading || !user) return;
    
    const onboardingKey = `quikle_onboarding_${user.id}`;
    const hasCompletedOnboarding = localStorage.getItem(onboardingKey);
    
    if (!hasCompletedOnboarding) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleNext = () => {
    const currentStepId = steps[currentStep].id;
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`quikle_onboarding_${user.id}`, 'completed');
    }
    setIsOpen(false);
    navigate('/dashboard');
  };

  const handleStepAction = (step: OnboardingStep) => {
    if (step.action) {
      step.action();
      setIsOpen(false);
      if (user) {
        localStorage.setItem(`quikle_onboarding_${user.id}`, 'completed');
      }
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-quikle-silver/30 shadow-luxury">
        {/* Progress bar */}
        <div className="h-1 bg-quikle-silver/20">
          <div 
            className="h-full bg-gradient-to-r from-quikle-primary to-quikle-secondary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-gradient-to-r from-quikle-primary to-quikle-secondary" 
                    : index < currentStep
                    ? "w-2 bg-quikle-primary"
                    : "w-2 bg-quikle-silver/40"
                )}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-quikle-crystal to-white shadow-lg">
              {currentStepData.icon}
            </div>
          </div>

          {/* Content */}
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl luxury-text">
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription className="text-base text-quikle-slate leading-relaxed">
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>

          {/* Role badge for welcome step */}
          {currentStep === 0 && (
            <div className="flex justify-center mt-4">
              <Badge className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white border-0 px-4 py-1">
                {isCompanyOwner ? '👑 Company Owner' : `${employeeProfile?.role || 'Team Member'}`}
              </Badge>
            </div>
          )}

          {/* Action button for specific steps */}
          {currentStepData.action && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => handleStepAction(currentStepData)}
                className="border-quikle-primary/30 text-quikle-primary hover:bg-quikle-primary/10"
              >
                {currentStepData.actionLabel}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-quikle-silver/20">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-quikle-slate hover:text-quikle-charcoal"
            >
              Skip Tour
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="border-quikle-silver/30"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:from-quikle-secondary hover:to-quikle-primary text-white shadow-lg"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeOnboardingModal;
