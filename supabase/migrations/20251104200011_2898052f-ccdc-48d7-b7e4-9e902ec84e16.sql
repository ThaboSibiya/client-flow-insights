-- Create finance-specific roles enum
DO $$ BEGIN
  CREATE TYPE finance_role AS ENUM ('finance_admin', 'finance_manager', 'sales_view_only', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add finance_role to employee_privileges if not exists
ALTER TABLE employee_privileges 
ADD COLUMN IF NOT EXISTS finance_role finance_role DEFAULT 'none';

-- Create finance_audit_logs table for tracking all finance actions
CREATE TABLE IF NOT EXISTS finance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  employee_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  customer_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on finance_audit_logs
ALTER TABLE finance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and finance managers can view audit logs
DROP POLICY IF EXISTS "Finance admins can view audit logs" ON finance_audit_logs;
CREATE POLICY "Finance admins can view audit logs"
ON finance_audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employee_privileges ep
    JOIN employees e ON e.id = ep.employee_id
    WHERE e.auth_user_id = auth.uid()
    AND ep.finance_role IN ('finance_admin', 'finance_manager')
  )
);

-- Anyone can insert their own audit logs
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON finance_audit_logs;
CREATE POLICY "Users can insert their own audit logs"
ON finance_audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to log finance actions
CREATE OR REPLACE FUNCTION log_finance_action(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_employee_id UUID;
BEGIN
  SELECT id INTO v_employee_id
  FROM employees
  WHERE auth_user_id = auth.uid();

  INSERT INTO finance_audit_logs (
    user_id,
    employee_id,
    action_type,
    resource_type,
    resource_id,
    customer_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    v_employee_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_customer_id,
    p_old_values,
    p_new_values,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check finance permissions
CREATE OR REPLACE FUNCTION has_finance_permission(
  p_user_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM employee_privileges ep
    JOIN employees e ON e.id = ep.employee_id
    WHERE e.auth_user_id = p_user_id
    AND (
      (p_permission = 'full_access' AND ep.finance_role IN ('finance_admin', 'finance_manager'))
      OR (p_permission = 'view_only' AND ep.finance_role IN ('finance_admin', 'finance_manager', 'sales_view_only'))
      OR (p_permission = 'admin_only' AND ep.finance_role = 'finance_admin')
    )
  );
$$;

-- Update RLS policies for Customer Finance Summary
DROP POLICY IF EXISTS "Users can view their customer finance summary" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can insert their customer finance summary" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can update their customer finance summary" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can delete their customer finance summary" ON customer_finance_summary;

CREATE POLICY "Finance users can view customer finance summary"
ON customer_finance_summary FOR SELECT
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'view_only'));

CREATE POLICY "Finance admins can insert customer finance summary"
ON customer_finance_summary FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can update customer finance summary"
ON customer_finance_summary FOR UPDATE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can delete customer finance summary"
ON customer_finance_summary FOR DELETE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'admin_only'));

-- Update RLS policies for Invoices
DROP POLICY IF EXISTS "Users can view their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their invoices" ON invoices;

CREATE POLICY "Finance users can view invoices"
ON invoices FOR SELECT
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'view_only'));

CREATE POLICY "Finance admins can insert invoices"
ON invoices FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can update invoices"
ON invoices FOR UPDATE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can delete invoices"
ON invoices FOR DELETE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'admin_only'));

-- Update RLS policies for Finance Notes
DROP POLICY IF EXISTS "Users can view their finance notes" ON finance_notes;
DROP POLICY IF EXISTS "Users can insert their finance notes" ON finance_notes;
DROP POLICY IF EXISTS "Users can update their finance notes" ON finance_notes;
DROP POLICY IF EXISTS "Users can delete their finance notes" ON finance_notes;

CREATE POLICY "Finance users can view finance notes"
ON finance_notes FOR SELECT
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'view_only'));

CREATE POLICY "Finance admins can insert finance notes"
ON finance_notes FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can update finance notes"
ON finance_notes FOR UPDATE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can delete finance notes"
ON finance_notes FOR DELETE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

-- Update RLS policies for Customer Transactions
DROP POLICY IF EXISTS "Users can view their customer transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Users can insert their customer transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Users can update their customer transactions" ON customer_transactions;
DROP POLICY IF EXISTS "Users can delete their customer transactions" ON customer_transactions;

CREATE POLICY "Finance users can view customer transactions"
ON customer_transactions FOR SELECT
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'view_only'));

CREATE POLICY "Finance admins can insert customer transactions"
ON customer_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can update customer transactions"
ON customer_transactions FOR UPDATE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can delete customer transactions"
ON customer_transactions FOR DELETE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'admin_only'));

-- Update RLS policies for Account Flags
DROP POLICY IF EXISTS "Users can view their account flags" ON account_flags;
DROP POLICY IF EXISTS "Users can insert their account flags" ON account_flags;
DROP POLICY IF EXISTS "Users can update their account flags" ON account_flags;
DROP POLICY IF EXISTS "Users can delete their account flags" ON account_flags;

CREATE POLICY "Finance users can view account flags"
ON account_flags FOR SELECT
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'view_only'));

CREATE POLICY "Finance admins can insert account flags"
ON account_flags FOR INSERT
WITH CHECK (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can update account flags"
ON account_flags FOR UPDATE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'full_access'));

CREATE POLICY "Finance admins can delete account flags"
ON account_flags FOR DELETE
USING (auth.uid() = user_id AND has_finance_permission(auth.uid(), 'admin_only'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_user_id ON finance_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_customer_id ON finance_audit_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_created_at ON finance_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_action_type ON finance_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_employee_privileges_finance_role ON employee_privileges(finance_role);