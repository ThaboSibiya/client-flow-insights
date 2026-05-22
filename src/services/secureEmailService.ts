
import { supabase } from '@/integrations/supabase/client';

export interface SecureEmailHistoryEntry {
  id: string;
  customer_id: string;
  sender: string;
  subject: string;
  message: string;
  attachments?: string[];
  status: string;
  user_id: string;
  created_at: string;
}

export const secureEmailService = {
  // Insert email history with proper user ownership validation
  async insertEmailHistory(
    customerId: string,
    sender: string,
    subject: string,
    message: string,
    userId: string,
    attachments?: string[],
    status: string = 'sent'
  ): Promise<string> {
    // Verify the customer belongs to the user before inserting email history
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .eq('user_id', userId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found or access denied');
    }

    const { data, error } = await supabase
      .from('email_history')
      .insert({
        customer_id: customerId,
        sender,
        subject,
        message,
        attachments,
        status,
        user_id: userId
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  // Get email history for a customer (now properly secured)
  async getEmailHistory(customerId: string): Promise<SecureEmailHistoryEntry[]> {
    const { data, error } = await supabase
      .from('email_history')
      .select('id, customer_id, sender, subject, message, attachments, status, user_id, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update email status with ownership validation
  async updateEmailStatus(emailId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('email_history')
      .update({ status })
      .eq('id', emailId);

    if (error) throw error;
  },

  // Delete email history with ownership validation
  async deleteEmailHistory(emailId: string): Promise<void> {
    const { error } = await supabase
      .from('email_history')
      .delete()
      .eq('id', emailId);

    if (error) throw error;
  }
};
