// Backend finance types matching database schema
export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'eft' | 'paypal' | 'other';
export type FlagType = 'credit_hold' | 'payment_issue' | 'collection' | 'dispute' | 'fraud_risk' | 'review_required' | 'vip' | 'other';
export type FlagStatus = 'active' | 'resolved' | 'escalated' | 'dismissed';
export type NoteTag = 'reminder' | 'call' | 'promise_to_pay' | 'dispute' | 'payment_plan' | 'escalation' | 'collection' | 'general';

export interface Invoice {
  id: string;
  customer_id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string;
  issue_date: string;
  paid_date: string | null;
  description: string | null;
  terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  invoice_id: string | null;
  user_id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceNote {
  id: string;
  customer_id: string;
  user_id: string;
  note: string;
  tag: NoteTag | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AccountFlag {
  id: string;
  customer_id: string;
  user_id: string;
  flag_type: FlagType;
  flag_reason: string;
  status: FlagStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  flagged_by: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}
