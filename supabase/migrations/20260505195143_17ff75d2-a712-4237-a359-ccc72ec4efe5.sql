
-- 1. user_subscriptions: restrict to authenticated only
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Hide payment credentials from client reads on user_subscriptions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='paystack_authorization_code') THEN
    EXECUTE 'REVOKE SELECT (paystack_authorization_code) ON public.user_subscriptions FROM authenticated, anon';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='paystack_subscription_code') THEN
    EXECUTE 'REVOKE SELECT (paystack_subscription_code) ON public.user_subscriptions FROM authenticated, anon';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='paystack_customer_code') THEN
    EXECUTE 'REVOKE SELECT (paystack_customer_code) ON public.user_subscriptions FROM authenticated, anon';
  END IF;
END $$;

-- 2. workspace_subscriptions: revoke remaining payment credential columns
REVOKE SELECT (paystack_subscription_code, paystack_customer_code)
  ON public.workspace_subscriptions FROM authenticated, anon;

-- 3. user_oauth_apps: restrict to authenticated, hide client_secret from client reads
DROP POLICY IF EXISTS "Users can view their own OAuth apps" ON public.user_oauth_apps;
DROP POLICY IF EXISTS "Users can create their own OAuth apps" ON public.user_oauth_apps;
DROP POLICY IF EXISTS "Users can update their own OAuth apps" ON public.user_oauth_apps;
DROP POLICY IF EXISTS "Users can delete their own OAuth apps" ON public.user_oauth_apps;

CREATE POLICY "Users can view their own OAuth apps"
ON public.user_oauth_apps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth apps"
ON public.user_oauth_apps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth apps"
ON public.user_oauth_apps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth apps"
ON public.user_oauth_apps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_oauth_apps' AND column_name='client_secret') THEN
    EXECUTE 'REVOKE SELECT (client_secret) ON public.user_oauth_apps FROM authenticated, anon';
  END IF;
END $$;

-- 4. employees: split workspace-member ALL policy into SELECT-only for members,
--    while INSERT/UPDATE/DELETE require company_owner_id = auth.uid().
DROP POLICY IF EXISTS "Workspace members can manage employees" ON public.employees;

CREATE POLICY "Owners and members can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (
  company_owner_id = (SELECT auth.uid())
  OR is_workspace_member((SELECT auth.uid()), workspace_id)
);

CREATE POLICY "Only company owner can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (company_owner_id = (SELECT auth.uid()));

CREATE POLICY "Only company owner can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (company_owner_id = (SELECT auth.uid()))
WITH CHECK (company_owner_id = (SELECT auth.uid()));

CREATE POLICY "Only company owner can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (company_owner_id = (SELECT auth.uid()));

-- 5. rate_limiting: restrict to authenticated, require non-null user_id
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.rate_limiting;

CREATE POLICY "Users can manage their own rate limits"
ON public.rate_limiting
FOR ALL
TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid())
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());
