-- Add credit_limit to customers table if not exists
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10,2) DEFAULT 0;

-- Create finance_notes table (separate from debtor_notes for specific finance tracking)
CREATE TABLE IF NOT EXISTS public.finance_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  tag TEXT CHECK (tag IN ('reminder', 'call', 'promise_to_pay', 'dispute', 'payment_plan', 'escalation', 'collection', 'general')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled', 'partial')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  payment_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'eft', 'paypal', 'other')),
  reference_number TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create account_flags table for internal review
CREATE TABLE IF NOT EXISTS public.account_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('credit_hold', 'payment_issue', 'collection', 'dispute', 'fraud_risk', 'review_required', 'vip', 'other')),
  flag_reason TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'dismissed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  flagged_by TEXT NOT NULL,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.finance_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_notes
CREATE POLICY "Users can view their finance notes"
  ON public.finance_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their finance notes"
  ON public.finance_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their finance notes"
  ON public.finance_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their finance notes"
  ON public.finance_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view their invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their payments"
  ON public.payments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for account_flags
CREATE POLICY "Users can view their account flags"
  ON public.account_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their account flags"
  ON public.account_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their account flags"
  ON public.account_flags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their account flags"
  ON public.account_flags FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_finance_notes_customer ON public.finance_notes(customer_id);
CREATE INDEX idx_finance_notes_user ON public.finance_notes(user_id);
CREATE INDEX idx_finance_notes_tag ON public.finance_notes(tag);

CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_user ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_number ON public.payments(payment_number);

CREATE INDEX idx_account_flags_customer ON public.account_flags(customer_id);
CREATE INDEX idx_account_flags_user ON public.account_flags(user_id);
CREATE INDEX idx_account_flags_status ON public.account_flags(status);
CREATE INDEX idx_account_flags_type ON public.account_flags(flag_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_finance_notes_updated_at
  BEFORE UPDATE ON public.finance_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_flags_updated_at
  BEFORE UPDATE ON public.account_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to auto-update invoice status when fully paid
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  total_paid NUMERIC;
  invoice_amount NUMERIC;
BEGIN
  -- Calculate total payments for this invoice
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.payments
  WHERE invoice_id = NEW.invoice_id AND status = 'completed';
  
  -- Get invoice amount
  SELECT total_amount INTO invoice_amount
  FROM public.invoices
  WHERE id = NEW.invoice_id;
  
  -- Update invoice status based on payment
  IF total_paid >= invoice_amount THEN
    UPDATE public.invoices 
    SET status = 'paid', paid_date = NEW.payment_date
    WHERE id = NEW.invoice_id;
  ELSIF total_paid > 0 AND total_paid < invoice_amount THEN
    UPDATE public.invoices 
    SET status = 'partial'
    WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-updating invoice status
CREATE TRIGGER payment_updates_invoice_status
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.invoice_id IS NOT NULL AND NEW.status = 'completed')
  EXECUTE FUNCTION update_invoice_status_on_payment();

-- Create a function to check and update overdue invoices
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status IN ('pending', 'sent', 'partial')
    AND due_date < now()
    AND status != 'overdue';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;