import { supabase } from '@/integrations/supabase/client';

/**
 * Business Logic Service for Finance Operations
 * Handles account summaries, reconciliation, and notifications
 */
export const financeBusinessLogic = {
  /**
   * Calculate comprehensive account summary for a customer
   * - Total owed, outstanding balance, last payment
   * - Risk rating calculation
   * - Updates customer_finance_summary table
   */
  async calculateAccountSummary(customerId: string) {
    const { data, error } = await supabase.functions.invoke('finance-calculate-summary', {
      body: { customerId },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  },

  /**
   * Reconcile transactions - match payments to invoices
   * - Auto-matches payments by amount
   * - Updates invoice statuses (paid/partial)
   * - Identifies unmatched transactions
   */
  async reconcileTransactions(customerId: string, autoMatch: boolean = true) {
    const { data, error } = await supabase.functions.invoke('finance-reconcile-transactions', {
      body: { 
        customerId,
        autoMatch 
      },
      method: 'POST',
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send automated notifications
   * Types: overdue_payment, payment_reminder, account_flagged, payment_received
   * Also saves to reminder_history table
   */
  async sendNotification(
    customerId: string, 
    notificationType: 'overdue_payment' | 'payment_reminder' | 'account_flagged' | 'payment_received',
    customMessage?: string
  ) {
    const { data, error } = await supabase.functions.invoke('finance-send-notifications', {
      body: { 
        customerId,
        notificationType,
        customMessage 
      },
      method: 'POST',
    });

    if (error) throw error;

    // Save to reminder history
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && customMessage) {
        await supabase.from('reminder_history').insert({
          customer_id: customerId,
          user_id: user.id,
          reminder_type: notificationType,
          message: customMessage,
          sent_by: user.email || 'System',
          status: 'sent'
        });
      }
    } catch (historyError) {
      console.error('Failed to save reminder history:', historyError);
    }

    return data;
  },

  /**
   * Trigger overdue invoice check (typically run via cron)
   * - Marks invoices as overdue
   * - Creates account flags for high-risk customers
   * - Logs notifications needed
   */
  async checkOverdueInvoices() {
    const { data, error } = await supabase.functions.invoke('finance-cron-check-overdue', {
      body: {},
      method: 'POST',
    });

    if (error) throw error;
    return data;
  },

  /**
   * Batch process: Calculate summaries for multiple customers
   */
  async batchCalculateSummaries(customerIds: string[]) {
    const results = [];
    for (const customerId of customerIds) {
      try {
        const result = await this.calculateAccountSummary(customerId);
        results.push({ customerId, success: true, data: result });
      } catch (error) {
        results.push({ 
          customerId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    return results;
  },

  /**
   * Complete finance workflow for a customer
   * 1. Calculate summary
   * 2. Reconcile transactions
   * 3. Check for overdue and send notifications if needed
   */
  async runCompleteFinanceWorkflow(customerId: string) {
    try {
      // Step 1: Calculate account summary
      const summaryResult = await this.calculateAccountSummary(customerId);
      
      // Step 2: Reconcile transactions
      const reconcileResult = await this.reconcileTransactions(customerId, true);
      
      // Step 3: Check if notifications are needed
      const summary = summaryResult.summary;
      const notifications = [];

      if (summary.overdue_count > 0) {
        await this.sendNotification(customerId, 'overdue_payment');
        notifications.push('overdue_payment');
      }

      // Check if payment reminder needed (upcoming due dates within 3 days)
      if (summary.next_due_date) {
        const daysUntilDue = Math.floor(
          (new Date(summary.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          await this.sendNotification(customerId, 'payment_reminder');
          notifications.push('payment_reminder');
        }
      }

      return {
        success: true,
        summary: summaryResult,
        reconciliation: reconcileResult,
        notifications_sent: notifications
      };
    } catch (error) {
      console.error('Error in complete finance workflow:', error);
      throw error;
    }
  }
};
