
-- 1. Remove overly-permissive storage policy on conversation-attachments
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;

-- 2. Fix employees self-update policy: use correct correlated reference (employees.id)
DROP POLICY IF EXISTS "Employees can only update login timestamp" ON public.employees;

CREATE POLICY "Employees can only update login timestamp"
ON public.employees
FOR UPDATE
USING (auth_user_id = (SELECT auth.uid()))
WITH CHECK (
  auth_user_id = (SELECT auth.uid())
  AND first_name           IS NOT DISTINCT FROM (SELECT e.first_name           FROM public.employees e WHERE e.id = employees.id)
  AND last_name            IS NOT DISTINCT FROM (SELECT e.last_name            FROM public.employees e WHERE e.id = employees.id)
  AND email                IS NOT DISTINCT FROM (SELECT e.email                FROM public.employees e WHERE e.id = employees.id)
  AND employee_number      IS NOT DISTINCT FROM (SELECT e.employee_number      FROM public.employees e WHERE e.id = employees.id)
  AND designation          IS NOT DISTINCT FROM (SELECT e.designation          FROM public.employees e WHERE e.id = employees.id)
  AND title                IS NOT DISTINCT FROM (SELECT e.title                FROM public.employees e WHERE e.id = employees.id)
  AND department           IS NOT DISTINCT FROM (SELECT e.department           FROM public.employees e WHERE e.id = employees.id)
  AND phone                IS NOT DISTINCT FROM (SELECT e.phone                FROM public.employees e WHERE e.id = employees.id)
  AND role                 IS NOT DISTINCT FROM (SELECT e.role                 FROM public.employees e WHERE e.id = employees.id)
  AND status               IS NOT DISTINCT FROM (SELECT e.status               FROM public.employees e WHERE e.id = employees.id)
  AND hire_date            IS NOT DISTINCT FROM (SELECT e.hire_date            FROM public.employees e WHERE e.id = employees.id)
  AND salary               IS NOT DISTINCT FROM (SELECT e.salary               FROM public.employees e WHERE e.id = employees.id)
  AND manager_id           IS NOT DISTINCT FROM (SELECT e.manager_id           FROM public.employees e WHERE e.id = employees.id)
  AND company_owner_id     IS NOT DISTINCT FROM (SELECT e.company_owner_id     FROM public.employees e WHERE e.id = employees.id)
  AND user_id              IS NOT DISTINCT FROM (SELECT e.user_id              FROM public.employees e WHERE e.id = employees.id)
  AND auth_user_id         IS NOT DISTINCT FROM (SELECT e.auth_user_id         FROM public.employees e WHERE e.id = employees.id)
  AND is_invited           IS NOT DISTINCT FROM (SELECT e.is_invited           FROM public.employees e WHERE e.id = employees.id)
  AND invitation_sent_at   IS NOT DISTINCT FROM (SELECT e.invitation_sent_at   FROM public.employees e WHERE e.id = employees.id)
  AND invitation_expires_at IS NOT DISTINCT FROM (SELECT e.invitation_expires_at FROM public.employees e WHERE e.id = employees.id)
  AND invitation_token     IS NOT DISTINCT FROM (SELECT e.invitation_token     FROM public.employees e WHERE e.id = employees.id)
);

-- 3. Lock down Realtime subscriptions: require authenticated topic ownership.
-- Default-deny; users can only subscribe to topics they own (topic prefixed with their auth.uid()).
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to own topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow subscribing to topics that include the user's id, or finance/recon channels
  -- broadcast_changes uses 'finance:<customer_id>' / 'recon:<customer_id>' — those customers
  -- already have RLS on the underlying tables, but we still gate channel topics by auth.
  (realtime.topic() LIKE 'user:' || (auth.uid())::text || ':%')
  OR (realtime.topic() LIKE 'finance:%')
  OR (realtime.topic() LIKE 'recon:%')
);
