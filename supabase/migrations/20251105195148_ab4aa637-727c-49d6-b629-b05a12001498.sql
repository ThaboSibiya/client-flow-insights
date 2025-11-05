-- Create reconciliation_notes table for tracking notes on invoices, payments, and reconciliation actions
CREATE TABLE IF NOT EXISTS public.reconciliation_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'general',
  note_content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  is_system_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.reconciliation_notes IS 'Stores notes and comments for reconciliation activities with full audit trail';

-- Create indexes for better performance
CREATE INDEX idx_reconciliation_notes_user_id ON public.reconciliation_notes(user_id);
CREATE INDEX idx_reconciliation_notes_customer_id ON public.reconciliation_notes(customer_id);
CREATE INDEX idx_reconciliation_notes_invoice_id ON public.reconciliation_notes(invoice_id);
CREATE INDEX idx_reconciliation_notes_payment_id ON public.reconciliation_notes(payment_id);
CREATE INDEX idx_reconciliation_notes_created_at ON public.reconciliation_notes(created_at DESC);
CREATE INDEX idx_reconciliation_notes_note_type ON public.reconciliation_notes(note_type);

-- Enable RLS
ALTER TABLE public.reconciliation_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reconciliation notes"
  ON public.reconciliation_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reconciliation notes"
  ON public.reconciliation_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reconciliation notes"
  ON public.reconciliation_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reconciliation notes"
  ON public.reconciliation_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Finance admins can view all reconciliation notes
CREATE POLICY "Finance admins can view all reconciliation notes"
  ON public.reconciliation_notes
  FOR SELECT
  USING (
    auth.uid() = user_id 
    AND has_finance_permission(auth.uid(), 'view_only'::text)
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_reconciliation_notes_updated_at
  BEFORE UPDATE ON public.reconciliation_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();