import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CancelSubscriptionDialogProps {
  isPending: boolean;
  onConfirm: () => void;
}

const CancelSubscriptionDialog = ({ isPending, onConfirm }: CancelSubscriptionDialogProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const navigate = useNavigate();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending}>
          {isPending ? 'Cancelling...' : 'Cancel Subscription'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Cancel Your Subscription?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Please review the following before proceeding:</p>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  Access to paid features continues until the end of your current billing period.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  Your data will be retained for 30 days, then permanently deleted.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  All automations, webhooks, and employee accounts will be paused immediately.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  No partial refunds will be issued for the current billing cycle.
                </li>
              </ul>
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                />
                <label htmlFor="acknowledge" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                    onClick={() => navigate('/cancellation-policy')}
                  >
                    Cancellation Policy
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            disabled={!acknowledged || isPending}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelSubscriptionDialog;
