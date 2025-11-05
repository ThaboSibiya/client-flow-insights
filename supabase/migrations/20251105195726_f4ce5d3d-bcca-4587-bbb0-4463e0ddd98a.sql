-- Create enum for reconciliation status
CREATE TYPE public.reconciliation_status AS ENUM ('matched', 'partial', 'unmatched');

-- Create reconciliations table to track invoice-payment matches
CREATE TABLE IF NOT EXISTS public.reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  matched_amount NUMERIC(15, 2) NOT NULL CHECK (matched_amount >= 0),
  reconciliation_status public.reconciliation_status NOT NULL DEFAULT 'matched',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_invoice_payment_match UNIQUE (invoice_id, payment_id)
);

-- Add table comment
COMMENT ON TABLE public.reconciliations IS 'Tracks reconciliation matches between invoices and payments with full audit trail';

-- Create indexes for better query performance
CREATE INDEX idx_reconciliations_invoice_id ON public.reconciliations(invoice_id);
CREATE INDEX idx_reconciliations_payment_id ON public.reconciliations(payment_id);
CREATE INDEX idx_reconciliations_customer_id ON public.reconciliations(customer_id);
CREATE INDEX idx_reconciliations_created_by ON public.reconciliations(created_by);
CREATE INDEX idx_reconciliations_status ON public.reconciliations(reconciliation_status);
CREATE INDEX idx_reconciliations_created_at ON public.reconciliations(created_at DESC);

-- Enable RLS
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reconciliations"
  ON public.reconciliations
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = reconciliations.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own reconciliations"
  ON public.reconciliations
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_id
      AND invoices.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.payments
      WHERE payments.id = payment_id
      AND payments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reconciliations"
  ON public.reconciliations
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = reconciliations.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reconciliations"
  ON public.reconciliations
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = reconciliations.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Finance admins can view all reconciliations
CREATE POLICY "Finance admins can view all reconciliations"
  ON public.reconciliations
  FOR SELECT
  USING (
    has_finance_permission(auth.uid(), 'view_only'::text)
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_reconciliations_updated_at
  BEFORE UPDATE ON public.reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create reconciliation record when payment is matched
CREATE OR REPLACE FUNCTION public.auto_create_reconciliation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_amount NUMERIC;
  v_payment_amount NUMERIC;
  v_customer_id UUID;
  v_status reconciliation_status;
BEGIN
  -- Only proceed if invoice_id is being set or updated
  IF NEW.invoice_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.invoice_id IS DISTINCT FROM NEW.invoice_id) THEN
    -- Get invoice and payment details
    SELECT total_amount, customer_id INTO v_invoice_amount, v_customer_id
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    v_payment_amount := NEW.amount;
    
    -- Determine reconciliation status
    IF v_payment_amount >= v_invoice_amount THEN
      v_status := 'matched';
    ELSIF v_payment_amount > 0 AND v_payment_amount < v_invoice_amount THEN
      v_status := 'partial';
    ELSE
      v_status := 'unmatched';
    END IF;
    
    -- Insert or update reconciliation record
    INSERT INTO reconciliations (
      invoice_id,
      payment_id,
      customer_id,
      matched_amount,
      reconciliation_status,
      created_by,
      metadata
    ) VALUES (
      NEW.invoice_id,
      NEW.id,
      v_customer_id,
      v_payment_amount,
      v_status,
      NEW.user_id,
      jsonb_build_object(
        'invoice_amount', v_invoice_amount,
        'payment_amount', v_payment_amount,
        'auto_created', true
      )
    )
    ON CONFLICT (invoice_id, payment_id)
    DO UPDATE SET
      matched_amount = v_payment_amount,
      reconciliation_status = v_status,
      updated_at = now(),
      metadata = reconciliations.metadata || jsonb_build_object(
        'invoice_amount', v_invoice_amount,
        'payment_amount', v_payment_amount,
        'last_updated', now()
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create reconciliation records
CREATE TRIGGER auto_create_reconciliation_on_payment
  AFTER INSERT OR UPDATE OF invoice_id ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_reconciliation();

-- Log reconciliation changes to finance audit logs
CREATE OR REPLACE FUNCTION public.log_reconciliation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the reconciliation action
  INSERT INTO finance_audit_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    customer_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    COALESCE(NEW.created_by, OLD.created_by),
    CASE TG_OP
      WHEN 'INSERT' THEN 'reconciliation_created'
      WHEN 'UPDATE' THEN 'reconciliation_updated'
      WHEN 'DELETE' THEN 'reconciliation_deleted'
    END,
    'reconciliation',
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.customer_id, OLD.customer_id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    jsonb_build_object(
      'operation', TG_OP,
      'invoice_id', COALESCE(NEW.invoice_id, OLD.invoice_id),
      'payment_id', COALESCE(NEW.payment_id, OLD.payment_id),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to log reconciliation changes
CREATE TRIGGER log_reconciliation_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_reconciliation_change();