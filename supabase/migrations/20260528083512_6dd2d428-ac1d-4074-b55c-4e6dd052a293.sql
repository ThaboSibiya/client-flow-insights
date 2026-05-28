
-- 1) Privilege escalation: is_company_owner requires actual workspace ownership
CREATE OR REPLACE FUNCTION public.is_company_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE user_id = auth.uid()
      AND role = 'owner'
  );
$$;

-- 2) cyberlsi_auth_log: explicit restricted INSERT
DROP POLICY IF EXISTS "Users can insert their own CyberLSI auth log" ON public.cyberlsi_auth_log;
CREATE POLICY "Users can insert their own CyberLSI auth log"
ON public.cyberlsi_auth_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3) finance_audit_logs: allow owners to view their own entries
DROP POLICY IF EXISTS "Users can view their own finance audit logs" ON public.finance_audit_logs;
CREATE POLICY "Users can view their own finance audit logs"
ON public.finance_audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4) ticket_attachments: require ticket ownership; ticket_id is text so cast
DROP POLICY IF EXISTS "Users can CRUD ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can view their ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can insert their ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can update their ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can delete their ticket attachments" ON public.ticket_attachments;

CREATE POLICY "Users can view their ticket attachments"
ON public.ticket_attachments
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = ticket_attachments.ticket_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their ticket attachments"
ON public.ticket_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = ticket_attachments.ticket_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their ticket attachments"
ON public.ticket_attachments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = ticket_attachments.ticket_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = ticket_attachments.ticket_id
      AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their ticket attachments"
ON public.ticket_attachments
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = ticket_attachments.ticket_id
      AND t.user_id = auth.uid()
  )
);
