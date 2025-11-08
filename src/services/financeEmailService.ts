import { supabase } from '@/integrations/supabase/client';

export const financeEmailService = {
  /**
   * Send statement email to customer
   */
  async emailStatement(
    customerId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      recipientEmail?: string;
    }
  ) {
    const { data, error } = await supabase.functions.invoke('customer-email-statement', {
      body: {
        customerId,
        ...options
      },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  }
};
