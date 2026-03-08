import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PAYSTACK_PUBLIC_KEY = 'pk_live_40ca1dd56a5f2c88ff30208434d8f0934e1d107e';

interface InitializePaymentParams {
  planName: string;
  amount: number;
  currency: 'ZAR' | 'USD';
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      return data;
    },
  });

  const initializePayment = useMutation({
    mutationFn: async ({ planName, amount, currency }: InitializePaymentParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Use a clean callback URL — Paystack appends ?trxref=xxx&reference=xxx
      const callbackUrl = `${window.location.origin}/settings/billing`;

      const response = await supabase.functions.invoke('paystack-initialize', {
        body: {
          plan_name: planName,
          amount,
          currency,
          callback_url: callbackUrl,
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

      // Verify payment server-side via Paystack API
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
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
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

      const response = await supabase.functions.invoke('paystack-cancel', {
        body: {},
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data?.cancelled) {
        throw new Error(response.data?.error || 'Cancellation failed');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
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

  const currentPlan = subscription?.plan_name || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';

  return {
    subscription,
    isLoading,
    currentPlan,
    isActive,
    isPastDue,
    initializePayment,
    verifyPayment,
    cancelSubscription,
    paystackPublicKey: PAYSTACK_PUBLIC_KEY,
  };
};
