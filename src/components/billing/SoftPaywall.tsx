import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface SoftPaywallProps {
  feature?: string;
  requiredPlan?: string;
  children: React.ReactNode;
}

const SoftPaywall: React.FC<SoftPaywallProps> = ({
  feature = 'this feature',
  requiredPlan = 'Team',
  children,
}) => {
  const { currentPlan, isActive } = useSubscription();
  const navigate = useNavigate();

  const planHierarchy: Record<string, number> = {
    free: 0,
    Solo: 1,
    Team: 2,
    Enterprise: 3,
  };

  const currentLevel = planHierarchy[currentPlan] ?? 0;
  const requiredLevel = planHierarchy[requiredPlan] ?? 0;

  if (currentLevel >= requiredLevel && isActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="max-w-sm w-full shadow-luxury border-quikle-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-quikle-primary to-quikle-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-quikle-charcoal">
                Upgrade to {requiredPlan}
              </h3>
              <p className="text-sm text-quikle-slate mt-1">
                Unlock {feature} and more with the {requiredPlan} plan.
              </p>
            </div>
            <Button
              onClick={() => navigate('/settings/billing')}
              className="w-full gap-2"
            >
              View Plans <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoftPaywall;
