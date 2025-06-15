
export type QuoteInvoiceType = 'quote' | 'invoice';
export type QuoteInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected';

export interface QuoteInvoiceItem {
  id: string;
  quote_invoice_id: string;
  user_id: string;
  description: string;
  quantity: number;
  rate: number;
  created_at: string;
}

export interface QuoteInvoice {
  id: string;
  user_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  type: QuoteInvoiceType;
  number: string;
  subject: string | null;
  status: QuoteInvoiceStatus;
  issue_date: string;
  due_date: string | null;
  valid_until: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
  quote_invoice_items: QuoteInvoiceItem[];
}
