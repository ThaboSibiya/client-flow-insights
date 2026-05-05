
-- 1. Lock down user_subscriptions: only backend (service role) writes
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.user_subscriptions;

-- (SELECT-only "Users can view own subscription" remains in place.)

-- 2. Tenant-scope finance reconciliation visibility
DROP POLICY IF EXISTS "Finance admins can view all reconciliations" ON public.reconciliations;

CREATE POLICY "Finance admins can view tenant reconciliations"
ON public.reconciliations
FOR SELECT
TO authenticated
USING (
  has_finance_permission(auth.uid(), 'view_only')
  AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = reconciliations.invoice_id
        AND i.user_id = auth.uid()
    )
  )
);

-- 3. Tenant-scope finance audit log visibility
DROP POLICY IF EXISTS "Finance admins can view audit logs" ON public.finance_audit_logs;

CREATE POLICY "Finance admins can view their tenant audit logs"
ON public.finance_audit_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.employee_privileges ep
    JOIN public.employees e ON e.id = ep.employee_id
    WHERE e.auth_user_id = auth.uid()
      AND ep.finance_role = ANY (ARRAY['finance_admin'::finance_role, 'finance_manager'::finance_role])
  )
);
