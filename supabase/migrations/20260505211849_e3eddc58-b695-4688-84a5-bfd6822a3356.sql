
-- =========================================================================
-- Explicit deny-all (no-access) policies for secret-only tables
-- =========================================================================
CREATE POLICY "No client access to user subscription secrets"
ON public.user_subscription_secrets
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No client access to workspace subscription secrets"
ON public.workspace_subscription_secrets
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No client access to user oauth app secrets"
ON public.user_oauth_app_secrets
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- =========================================================================
-- form_submissions: restrict to authenticated owners
-- =========================================================================
DROP POLICY IF EXISTS "Company owners can manage their form submissions" ON public.form_submissions;

CREATE POLICY "Company owners can view their form submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (company_owner_id = auth.uid());

CREATE POLICY "Company owners can insert their form submissions"
ON public.form_submissions
FOR INSERT
TO authenticated
WITH CHECK (company_owner_id = auth.uid());

CREATE POLICY "Company owners can update their form submissions"
ON public.form_submissions
FOR UPDATE
TO authenticated
USING (company_owner_id = auth.uid())
WITH CHECK (company_owner_id = auth.uid());

CREATE POLICY "Company owners can delete their form submissions"
ON public.form_submissions
FOR DELETE
TO authenticated
USING (company_owner_id = auth.uid());
