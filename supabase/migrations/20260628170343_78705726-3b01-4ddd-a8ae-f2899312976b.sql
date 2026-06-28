
-- Extend SELECT policy on scheduled_calls so assigned employees and workspace members can read their appointments
DROP POLICY IF EXISTS "Users can view scheduled calls for their customers" ON public.scheduled_calls;
DROP POLICY IF EXISTS "scheduled_calls_select" ON public.scheduled_calls;
DROP POLICY IF EXISTS "scheduled_calls_select_extended" ON public.scheduled_calls;

CREATE POLICY "scheduled_calls_select_extended"
ON public.scheduled_calls
FOR SELECT
TO authenticated
USING (
  -- Customer owner
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = scheduled_calls.customer_id
      AND c.user_id = auth.uid()
  )
  -- Assigned employee viewing their own appointments
  OR assigned_employee_id = public.current_employee_id()
  -- Any workspace member of the call's workspace
  OR (
    workspace_id IS NOT NULL
    AND workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
  )
);
