export type RiskRating = 'low' | 'medium' | 'high' | 'critical';
export type AccountStatus = 'active' | 'suspended' | 'collection' | 'closed';
export type NoteType = 'reminder' | 'call' | 'promise_to_pay' | 'dispute' | 'payment_plan' | 'escalation' | 'general';
export type NotePriority = 'low' | 'normal' | 'high' | 'urgent';
export type TransactionType = 'invoice' | 'payment' | 'credit_note' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'overdue' | 'cancelled' | 'disputed';

export interface CustomerFinanceSummary {
  id: string;
  customer_id: string;
  user_id: string;
  account_number: string | null;
  current_balance: number;
  total_owed: number;
  credit_limit: number;
  credit_terms: string;
  risk_rating: RiskRating;
  account_status: AccountStatus;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtorNote {
  id: string;
  customer_id: string;
  user_id: string;
  note_type: NoteType;
  note_content: string;
  priority: NotePriority;
  follow_up_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerTransaction {
  id: string;
  customer_id: string;
  user_id: string;
  transaction_type: TransactionType;
  reference_number: string;
  amount: number;
  balance_after: number | null;
  status: TransactionStatus;
  due_date: string | null;
  payment_method: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}
