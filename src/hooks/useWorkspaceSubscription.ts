import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

interface InitializePaymentParams {
  planName: string;
  amount: number;
  currency: 'ZAR' | 'USD';
  workspaceId?: string;
}

export const useWorkspaceSubscription = (overrideWorkspaceId?: string) => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useActiveWorkspaceId();
  const workspaceId = overrideWorkspaceId || activeWorkspaceId;

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['workspace-subscription', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      const { data, error } = await supabase
        .from('workspace_subscriptions' as any)
        .select('id, workspace_id, user_id, plan_name, plan_amount, currency, status, paystack_reference, paystack_plan_code, trial_ends_at, current_period_start, current_period_end, cancelled_at, created_at, updated_at')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching workspace subscription:', error);
        return null;
      }
      return data;
    },
    enabled: !!workspaceId,
  });

  const initializePayment = useMutation({
    mutationFn: async ({ planName, amount, currency, workspaceId: wsId }: InitializePaymentParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be signed in to start a payment.');

      const targetWsId = wsId || workspaceId;
      if (!targetWsId) throw new Error('No active workspace. Please select a workspace and try again.');

      const callbackUrl = `${window.location.origin}/settings/billing`;

      const response = await supabase.functions.invoke('paystack-initialize', {
        body: {
          plan_name: planName,
          amount,
          currency,
          callback_url: callbackUrl,
          workspace_id: targetWsId,
        },
      });

      if (response.error) {
        // Surface the real error body from the edge function instead of the generic message
        let detail = response.error.message || 'Failed to initialize payment';
        try {
          const ctx: any = (response.error as any).context;
          if (ctx && typeof ctx.json === 'function') {
            const body = await ctx.json();
            if (body?.error) detail = typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
          } else if (ctx && typeof ctx.text === 'function') {
            const text = await ctx.text();
            if (text) detail = text;
          }
        } catch { /* ignore parse errors */ }
        throw new Error(detail);
      }
      if (!response.data?.authorization_url) {
        throw new Error('Payment service did not return a checkout URL. Please try again.');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('paystack-verify', {
        body: { reference },
      });

      if (response.error) {
        console.error('Paystack verify error:', response.error);
        throw new Error(response.error.message || 'Payment verification failed');
      }
      
      if (!response.data?.verified) {
        throw new Error(response.data?.message || 'Payment verification failed');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-subscription'] });
      toast({
        title: 'Payment Successful',
        description: data.already_processed 
          ? 'Your subscription is already active!'
          : `Your ${data.plan_name} subscription is now active!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Could not verify payment. Please contact support.',
        variant: 'destructive',
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      if (!workspaceId) throw new Error('No workspace selected');

      const response = await supabase.functions.invoke('paystack-cancel', {
        body: { workspace_id: workspaceId },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data?.cancelled) {
        throw new Error(response.data?.error || 'Cancellation failed');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-subscription'] });
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    },
  });

  const sub = subscription as any;
  const currentPlan = sub?.plan_name || 'free';
  const isPaidPlan = currentPlan && currentPlan !== 'free';
  const isActive = (sub?.status === 'active' && isPaidPlan) || sub?.status === 'trialing';
  const isPastDue = sub?.status === 'past_due';

  const trialEndsAt = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
  const now = new Date();
  const isTrialing = currentPlan === 'free' && !!trialEndsAt && trialEndsAt > now;
  // Free plan with no valid trial remaining → expired. Treat missing subscription
  // row or missing trial_ends_at as expired so access is gated (DB trigger should
  // always create one, but never trust the absence client-side).
  const isTrialExpired =
    !isLoading &&
    !!workspaceId &&
    currentPlan === 'free' &&
    (!trialEndsAt || trialEndsAt <= now);
  const trialDaysLeft = trialEndsAt && trialEndsAt > now
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscription: sub,
    isLoading,
    currentPlan,
    isActive,
    isPastDue,
    isTrialing,
    isTrialExpired,
    trialEndsAt,
    trialDaysLeft,
    workspaceId,
    initializePayment,
    verifyPayment,
    cancelSubscription,
  };
};
