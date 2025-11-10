import { supabase } from '@/integrations/supabase/client';
import { QuoteInvoice } from '@/types/quote';

export const invoiceService = {
  async getCustomerInvoices(customerId: string): Promise<QuoteInvoice[]> {
    // Using rpc or direct query to avoid type issues
    const { data: invoiceData } = await (supabase as any)
      .from('quote_invoices')
      .select('*, quote_invoice_items(*)')
      .eq('customer_id', customerId)
      .eq('type', 'invoice')
      .in('status', ['sent', 'overdue'])
      .order('issue_date', { ascending: false });

    return invoiceData || [];
  }
};
