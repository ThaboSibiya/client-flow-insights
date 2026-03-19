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
        .select('*')
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
      if (!session) throw new Error('Not authenticated');

      const targetWsId = wsId || workspaceId;
      if (!targetWsId) throw new Error('No workspace selected');

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

      if (response.error) throw new Error(response.error.message);
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
  const isActive = sub?.status === 'active' || sub?.status === 'trialing';
  const isPastDue = sub?.status === 'past_due';

  return {
    subscription: sub,
    isLoading,
    currentPlan,
    isActive,
    isPastDue,
    workspaceId,
    initializePayment,
    verifyPayment,
    cancelSubscription,
  };
};
