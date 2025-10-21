import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailConfirmationStatus {
  isConfirmed: boolean;
  loading: boolean;
  error: string | null;
}

export const useEmailConfirmationStatus = () => {
  const [status, setStatus] = useState<EmailConfirmationStatus>({
    isConfirmed: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkConfirmationStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;

        setStatus({
          isConfirmed: user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined,
          loading: false,
          error: null,
        });

        // Log confirmation status check
        if (user) {
          await supabase.from('security_events').insert({
            event_type: 'confirmation_status_checked',
            resource_type: 'user_account',
            user_id: user.id,
            metadata: {
              is_confirmed: user.email_confirmed_at !== null,
              checked_at: new Date().toISOString()
            }
          });
        }
      } catch (error: any) {
        console.error('Error checking confirmation status:', error);
        setStatus({
          isConfirmed: false,
          loading: false,
          error: error.message,
        });
      }
    };

    checkConfirmationStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus({
          isConfirmed: session?.user?.email_confirmed_at !== null && session?.user?.email_confirmed_at !== undefined,
          loading: false,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return status;
};
