
-- Drop the policy that depends on sensitive columns first
DROP POLICY IF EXISTS "Employees can only update login timestamp" ON public.employees;
DROP POLICY IF EXISTS "Employees can update their own non-sensitive fields" ON public.employees;

-- =========================================================================
-- 1. workspace_subscription_secrets
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.workspace_subscription_secrets (
  workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  paystack_authorization_code TEXT,
  paystack_email_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_subscription_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view workspace billing secrets"
ON public.workspace_subscription_secrets FOR SELECT TO authenticated
USING (has_workspace_role(auth.uid(), workspace_id, 'owner'::workspace_role));

CREATE POLICY "Owners can insert workspace billing secrets"
ON public.workspace_subscription_secrets FOR INSERT TO authenticated
WITH CHECK (has_workspace_role(auth.uid(), workspace_id, 'owner'::workspace_role));

CREATE POLICY "Owners can update workspace billing secrets"
ON public.workspace_subscription_secrets FOR UPDATE TO authenticated
USING (has_workspace_role(auth.uid(), workspace_id, 'owner'::workspace_role))
WITH CHECK (has_workspace_role(auth.uid(), workspace_id, 'owner'::workspace_role));

CREATE TRIGGER trg_workspace_subscription_secrets_updated_at
BEFORE UPDATE ON public.workspace_subscription_secrets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.workspace_subscription_secrets
  (workspace_id, paystack_customer_code, paystack_subscription_code, paystack_authorization_code, paystack_email_token)
SELECT workspace_id, paystack_customer_code, paystack_subscription_code, paystack_authorization_code, paystack_email_token
FROM public.workspace_subscriptions
WHERE paystack_customer_code IS NOT NULL OR paystack_subscription_code IS NOT NULL
   OR paystack_authorization_code IS NOT NULL OR paystack_email_token IS NOT NULL
ON CONFLICT (workspace_id) DO NOTHING;

ALTER TABLE public.workspace_subscriptions
  DROP COLUMN IF EXISTS paystack_customer_code,
  DROP COLUMN IF EXISTS paystack_subscription_code,
  DROP COLUMN IF EXISTS paystack_authorization_code,
  DROP COLUMN IF EXISTS paystack_email_token;

-- =========================================================================
-- 2. employee_sensitive
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.employee_sensitive (
  employee_id UUID PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
  company_owner_id UUID NOT NULL,
  salary NUMERIC,
  invitation_token TEXT,
  invitation_sent_at TIMESTAMPTZ,
  invitation_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_sensitive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owner can view employee sensitive data"
ON public.employee_sensitive FOR SELECT TO authenticated
USING (company_owner_id = auth.uid());

CREATE POLICY "Company owner can insert employee sensitive data"
ON public.employee_sensitive FOR INSERT TO authenticated
WITH CHECK (company_owner_id = auth.uid());

CREATE POLICY "Company owner can update employee sensitive data"
ON public.employee_sensitive FOR UPDATE TO authenticated
USING (company_owner_id = auth.uid()) WITH CHECK (company_owner_id = auth.uid());

CREATE POLICY "Company owner can delete employee sensitive data"
ON public.employee_sensitive FOR DELETE TO authenticated
USING (company_owner_id = auth.uid());

CREATE TRIGGER trg_employee_sensitive_updated_at
BEFORE UPDATE ON public.employee_sensitive
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.employee_sensitive
  (employee_id, company_owner_id, salary, invitation_token, invitation_sent_at, invitation_expires_at)
SELECT id, company_owner_id, salary, invitation_token, invitation_sent_at, invitation_expires_at
FROM public.employees
WHERE company_owner_id IS NOT NULL
ON CONFLICT (employee_id) DO NOTHING;

ALTER TABLE public.employees
  DROP COLUMN IF EXISTS salary,
  DROP COLUMN IF EXISTS invitation_token,
  DROP COLUMN IF EXISTS invitation_sent_at,
  DROP COLUMN IF EXISTS invitation_expires_at;

-- Recreate self-update policy without sensitive columns
CREATE POLICY "Employees can update their own non-sensitive fields"
ON public.employees FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
  auth_user_id = auth.uid()
  AND company_owner_id IS NOT DISTINCT FROM (SELECT e.company_owner_id FROM public.employees e WHERE e.id = employees.id)
  AND role IS NOT DISTINCT FROM (SELECT e.role FROM public.employees e WHERE e.id = employees.id)
  AND email IS NOT DISTINCT FROM (SELECT e.email FROM public.employees e WHERE e.id = employees.id)
  AND auth_user_id IS NOT DISTINCT FROM (SELECT e.auth_user_id FROM public.employees e WHERE e.id = employees.id)
  AND manager_id IS NOT DISTINCT FROM (SELECT e.manager_id FROM public.employees e WHERE e.id = employees.id)
);
