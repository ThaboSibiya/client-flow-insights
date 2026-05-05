
-- 1. Tighten realtime.messages policy: only allow user-scoped topics.
DROP POLICY IF EXISTS "Authenticated users can subscribe to own topics" ON realtime.messages;

CREATE POLICY "Authenticated users can subscribe to own topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
);

-- 2. Hide payment-authorization tokens from non-owner workspace members
--    via column-level privileges. RLS still allows row visibility for plan info,
--    but the sensitive token columns are not readable by `authenticated`.
REVOKE SELECT (paystack_authorization_code, paystack_email_token)
  ON public.workspace_subscriptions FROM authenticated;
REVOKE SELECT (paystack_authorization_code, paystack_email_token)
  ON public.workspace_subscriptions FROM anon;

-- Edge functions use the service_role key, which bypasses these grants.
