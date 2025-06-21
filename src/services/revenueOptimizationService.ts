
import { supabase } from '@/integrations/supabase/client';
import { QuoteInvoice, QuoteInvoiceStatus } from '@/types/quote';

export interface PaymentReminderConfig {
  enabled: boolean;
  reminderDays: number[];
  template: string;
  escalateToFinance: boolean;
}

export interface UpsellTrigger {
  id: string;
  customerId: string;
  trigger: 'high_value_customer' | 'repeat_buyer' | 'service_completion' | 'payment_history';
  recommendation: string;
  potentialValue: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

class RevenueOptimizationService {
  // Auto-convert approved quotes to invoices
  async autoConvertQuoteToInvoice(quoteId: string): Promise<QuoteInvoice | null> {
    try {
      const { data: quote, error: fetchError } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('id', quoteId)
        .eq('type', 'quote')
        .eq('status', 'accepted')
        .single();

      if (fetchError || !quote) {
        console.error('Quote not found or not accepted:', fetchError);
        return null;
      }

      // Create new invoice from quote
      const invoiceData = {
        ...quote,
        id: undefined, // Let database generate new ID
        type: 'invoice' as const,
        status: 'draft' as QuoteInvoiceStatus,
        number: `INV-${Date.now()}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newInvoice, error: createError } = await supabase
        .from('quotes_invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (createError || !newInvoice) {
        console.error('Failed to create invoice:', createError);
        return null;
      }

      // Copy quote items to invoice
      const invoiceItems = quote.quote_invoice_items.map(item => ({
        ...item,
        id: undefined,
        quote_invoice_id: newInvoice.id,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('quote_invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        console.error('Failed to create invoice items:', itemsError);
        // Rollback invoice creation
        await supabase.from('quotes_invoices').delete().eq('id', newInvoice.id);
        return null;
      }

      // Update quote status to indicate conversion
      await supabase
        .from('quotes_invoices')
        .update({ 
          status: 'accepted',
          notes: `${quote.notes || ''}\n\nConverted to Invoice ${newInvoice.number}`
        })
        .eq('id', quoteId);

      return newInvoice as QuoteInvoice;
    } catch (error) {
      console.error('Error in auto-convert quote to invoice:', error);
      return null;
    }
  }

  // Check for overdue invoices and generate notifications
  async checkOverdueInvoices(): Promise<QuoteInvoice[]> {
    try {
      const { data: overdueInvoices, error } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('type', 'invoice')
        .in('status', ['sent', 'overdue'])
        .lt('due_date', new Date().toISOString());

      if (error) {
        console.error('Error fetching overdue invoices:', error);
        return [];
      }

      // Update status to overdue if not already
      const invoicesToUpdate = overdueInvoices.filter(inv => inv.status !== 'overdue');
      if (invoicesToUpdate.length > 0) {
        await supabase
          .from('quotes_invoices')
          .update({ status: 'overdue' })
          .in('id', invoicesToUpdate.map(inv => inv.id));
      }

      return overdueInvoices as QuoteInvoice[];
    } catch (error) {
      console.error('Error checking overdue invoices:', error);
      return [];
    }
  }

  // Generate payment reminders based on due dates
  async generatePaymentReminders(reminderConfig: PaymentReminderConfig): Promise<QuoteInvoice[]> {
    if (!reminderConfig.enabled) return [];

    try {
      const remindersToSend: QuoteInvoice[] = [];

      for (const days of reminderConfig.reminderDays) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + days);

        const { data: invoices, error } = await supabase
          .from('quotes_invoices')
          .select('*, quote_invoice_items(*)')
          .eq('type', 'invoice')
          .eq('status', 'sent')
          .gte('due_date', reminderDate.toISOString().split('T')[0])
          .lt('due_date', new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (!error && invoices) {
          remindersToSend.push(...invoices as QuoteInvoice[]);
        }
      }

      return remindersToSend;
    } catch (error) {
      console.error('Error generating payment reminders:', error);
      return [];
    }
  }

  // Identify upselling opportunities
  async identifyUpsellOpportunities(userId: string): Promise<UpsellTrigger[]> {
    try {
      const opportunities: UpsellTrigger[] = [];

      // Get customer data
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId);

      if (customerError || !customers) return [];

      // Get invoice history
      const { data: invoices, error: invoiceError } = await supabase
        .from('quotes_invoices')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'invoice')
        .eq('status', 'paid');

      if (invoiceError || !invoices) return [];

      for (const customer of customers) {
        const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
        
        // High-value customer trigger
        const totalSpent = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
        if (totalSpent > 10000) {
          opportunities.push({
            id: `high-value-${customer.id}`,
            customerId: customer.id,
            trigger: 'high_value_customer',
            recommendation: 'Premium service package upgrade',
            potentialValue: totalSpent * 0.3,
            priority: 'high',
            createdAt: new Date()
          });
        }

        // Repeat buyer trigger
        if (customerInvoices.length >= 3) {
          const avgValue = totalSpent / customerInvoices.length;
          opportunities.push({
            id: `repeat-buyer-${customer.id}`,
            customerId: customer.id,
            trigger: 'repeat_buyer',
            recommendation: 'Loyalty discount on bulk services',
            potentialValue: avgValue * 2,
            priority: 'medium',
            createdAt: new Date()
          });
        }

        // Recent payment history trigger
        const recentPayments = customerInvoices.filter(inv => {
          const paidDate = new Date(inv.updated_at);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return paidDate > thirtyDaysAgo;
        });

        if (recentPayments.length > 0) {
          opportunities.push({
            id: `payment-history-${customer.id}`,
            customerId: customer.id,
            trigger: 'payment_history',
            recommendation: 'Additional service offering',
            potentialValue: recentPayments[0].total * 1.5,
            priority: 'low',
            createdAt: new Date()
          });
        }
      }

      return opportunities;
    } catch (error) {
      console.error('Error identifying upsell opportunities:', error);
      return [];
    }
  }

  // Send notification to finance team for overdue accounts
  async notifyFinanceTeam(overdueInvoices: QuoteInvoice[]): Promise<boolean> {
    try {
      if (overdueInvoices.length === 0) return true;

      const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const message = `
        <h2>Overdue Invoice Alert</h2>
        <p>There are ${overdueInvoices.length} overdue invoices totaling R${totalOverdueAmount.toFixed(2)}</p>
        <ul>
          ${overdueInvoices.map(inv => `
            <li>
              Invoice ${inv.number} - ${inv.customer_name} - R${inv.total.toFixed(2)}
              (Due: ${new Date(inv.due_date || '').toLocaleDateString()})
            </li>
          `).join('')}
        </ul>
        <p>Please follow up with these customers for payment collection.</p>
      `;

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'finance@company.com', // This should be configurable
          subject: `Overdue Invoice Alert - ${overdueInvoices.length} invoices`,
          message: message,
          senderName: 'Revenue Management System',
        }
      });

      if (error) {
        console.error('Failed to notify finance team:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error notifying finance team:', error);
      return false;
    }
  }

  // Calculate revenue metrics
  async calculateRevenueMetrics(userId: string, dateRange?: { start: Date; end: Date }) {
    try {
      let query = supabase
        .from('quotes_invoices')
        .select('*')
        .eq('user_id', userId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data: documents, error } = await query;

      if (error || !documents) return null;

      const quotes = documents.filter(doc => doc.type === 'quote');
      const invoices = documents.filter(doc => doc.type === 'invoice');

      const metrics = {
        totalQuotes: quotes.length,
        acceptedQuotes: quotes.filter(q => q.status === 'accepted').length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
        totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
        pendingRevenue: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0),
        overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
        quoteAcceptanceRate: quotes.length > 0 ? (quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100 : 0,
        paymentCollectionRate: invoices.length > 0 ? (invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100 : 0,
      };

      return metrics;
    } catch (error) {
      console.error('Error calculating revenue metrics:', error);
      return null;
    }
  }
}

export const revenueOptimizationService = new RevenueOptimizationService();
