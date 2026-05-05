
-- =========================================================================
-- 1. user_subscription_secrets (service-role only)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_subscription_secrets (
  user_id UUID PRIMARY KEY,
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  paystack_authorization_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscription_secrets ENABLE ROW LEVEL SECURITY;
-- No policies = no client-side access. Service role bypasses RLS.

CREATE TRIGGER trg_user_subscription_secrets_updated_at
BEFORE UPDATE ON public.user_subscription_secrets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate any existing rows
INSERT INTO public.user_subscription_secrets
  (user_id, paystack_customer_code, paystack_subscription_code, paystack_authorization_code)
SELECT user_id, paystack_customer_code, paystack_subscription_code, paystack_authorization_code
FROM public.user_subscriptions
WHERE paystack_customer_code IS NOT NULL
   OR paystack_subscription_code IS NOT NULL
   OR paystack_authorization_code IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.user_subscriptions
  DROP COLUMN IF EXISTS paystack_customer_code,
  DROP COLUMN IF EXISTS paystack_subscription_code,
  DROP COLUMN IF EXISTS paystack_authorization_code;

-- =========================================================================
-- 2. workspace_subscription_secrets: lock to service-role only
-- =========================================================================
DROP POLICY IF EXISTS "Owners can view workspace billing secrets" ON public.workspace_subscription_secrets;
DROP POLICY IF EXISTS "Owners can insert workspace billing secrets" ON public.workspace_subscription_secrets;
DROP POLICY IF EXISTS "Owners can update workspace billing secrets" ON public.workspace_subscription_secrets;

-- =========================================================================
-- 3. user_oauth_app_secrets (service-role only)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_oauth_app_secrets (
  oauth_app_id UUID PRIMARY KEY REFERENCES public.user_oauth_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  client_secret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_oauth_app_secrets ENABLE ROW LEVEL SECURITY;
-- No policies = no client-side access.

CREATE TRIGGER trg_user_oauth_app_secrets_updated_at
BEFORE UPDATE ON public.user_oauth_app_secrets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.user_oauth_app_secrets (oauth_app_id, user_id, client_secret)
SELECT id, user_id, client_secret
FROM public.user_oauth_apps
WHERE client_secret IS NOT NULL
ON CONFLICT (oauth_app_id) DO NOTHING;

ALTER TABLE public.user_oauth_apps
  DROP COLUMN IF EXISTS client_secret;
