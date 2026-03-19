
-- Create workspace_subscriptions table (per-workspace billing)
CREATE TABLE public.workspace_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- owner who initiated the subscription
  plan_name TEXT NOT NULL DEFAULT 'free',
  plan_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'free',
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  paystack_authorization_code TEXT,
  paystack_email_token TEXT,
  paystack_reference TEXT,
  paystack_plan_code TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Workspace members can view their workspace subscription
CREATE POLICY "Members can view workspace subscription"
ON public.workspace_subscriptions
FOR SELECT
TO authenticated
USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Only workspace owners can insert
CREATE POLICY "Owners can insert workspace subscription"
ON public.workspace_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_workspace_role(auth.uid(), workspace_id, 'owner')
);

-- Only workspace owners can update
CREATE POLICY "Owners can update workspace subscription"
ON public.workspace_subscriptions
FOR UPDATE
TO authenticated
USING (public.has_workspace_role(auth.uid(), workspace_id, 'owner'));

-- Trigger for updated_at
CREATE TRIGGER update_workspace_subscriptions_updated_at
BEFORE UPDATE ON public.workspace_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Plan limits helper function
CREATE OR REPLACE FUNCTION public.get_workspace_plan_limits(p_workspace_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE ws.plan_name
    WHEN 'Solo' THEN jsonb_build_object(
      'max_users', 1, 'max_customers', 500, 'max_storage_gb', 2, 'max_webhooks', 3
    )
    WHEN 'Team' THEN jsonb_build_object(
      'max_users', 10, 'max_customers', 2000, 'max_storage_gb', 10, 'max_webhooks', 10
    )
    WHEN 'Enterprise' THEN jsonb_build_object(
      'max_users', 999999, 'max_customers', 999999, 'max_storage_gb', 50, 'max_webhooks', 999999
    )
    ELSE jsonb_build_object(
      'max_users', 1, 'max_customers', 50, 'max_storage_gb', 0.5, 'max_webhooks', 1
    )
  END
  FROM public.workspace_subscriptions ws
  WHERE ws.workspace_id = p_workspace_id
  LIMIT 1;
$$;
