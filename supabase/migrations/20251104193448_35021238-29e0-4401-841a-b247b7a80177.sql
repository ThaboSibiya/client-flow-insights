-- Create customer_finance_summary table for financial overview
CREATE TABLE IF NOT EXISTS public.customer_finance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  account_number TEXT,
  current_balance NUMERIC(10,2) DEFAULT 0,
  total_owed NUMERIC(10,2) DEFAULT 0,
  credit_limit NUMERIC(10,2) DEFAULT 0,
  credit_terms TEXT DEFAULT 'Net 30',
  risk_rating TEXT DEFAULT 'low' CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'collection', 'closed')),
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_amount NUMERIC(10,2),
  next_due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debtor_notes table for tracking debtor interactions
CREATE TABLE IF NOT EXISTS public.debtor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('reminder', 'call', 'promise_to_pay', 'dispute', 'payment_plan', 'escalation', 'general')),
  note_content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer_transactions table for payment and invoice history
CREATE TABLE IF NOT EXISTS public.customer_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'payment', 'credit_note', 'adjustment')),
  reference_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled', 'disputed')),
  due_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_finance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debtor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_finance_summary
CREATE POLICY "Users can view their customer finance summary"
  ON public.customer_finance_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their customer finance summary"
  ON public.customer_finance_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their customer finance summary"
  ON public.customer_finance_summary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their customer finance summary"
  ON public.customer_finance_summary FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for debtor_notes
CREATE POLICY "Users can view their debtor notes"
  ON public.debtor_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their debtor notes"
  ON public.debtor_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their debtor_notes"
  ON public.debtor_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their debtor notes"
  ON public.debtor_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for customer_transactions
CREATE POLICY "Users can view their customer transactions"
  ON public.customer_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their customer transactions"
  ON public.customer_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their customer transactions"
  ON public.customer_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their customer transactions"
  ON public.customer_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_customer_finance_summary_customer ON public.customer_finance_summary(customer_id);
CREATE INDEX idx_customer_finance_summary_user ON public.customer_finance_summary(user_id);
CREATE INDEX idx_debtor_notes_customer ON public.debtor_notes(customer_id);
CREATE INDEX idx_debtor_notes_user ON public.debtor_notes(user_id);
CREATE INDEX idx_debtor_notes_follow_up ON public.debtor_notes(follow_up_date);
CREATE INDEX idx_customer_transactions_customer ON public.customer_transactions(customer_id);
CREATE INDEX idx_customer_transactions_user ON public.customer_transactions(user_id);
CREATE INDEX idx_customer_transactions_date ON public.customer_transactions(created_at);

-- Create trigger for updating updated_at
CREATE TRIGGER update_customer_finance_summary_updated_at
  BEFORE UPDATE ON public.customer_finance_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debtor_notes_updated_at
  BEFORE UPDATE ON public.debtor_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_transactions_updated_at
  BEFORE UPDATE ON public.customer_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();