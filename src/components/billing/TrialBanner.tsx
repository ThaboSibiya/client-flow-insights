import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';

const TrialBanner: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlan, isActive, isTrialing, isTrialExpired, trialDaysLeft } = useWorkspaceSubscription();

  // Don't show for paid active plans
  if (isActive && currentPlan !== 'free') return null;

  // Don't show if no trial info
  if (!isTrialing && !isTrialExpired) return null;

  if (isTrialExpired) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive font-medium truncate">
            Your free trial has expired. This workspace is now read-only.
          </p>
        </div>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs shrink-0"
          onClick={() => navigate('/settings/billing')}
        >
          Upgrade now <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  if (isTrialing && trialDaysLeft <= 7) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
            {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your free trial
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          onClick={() => navigate('/settings/billing')}
        >
          Choose a plan <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
