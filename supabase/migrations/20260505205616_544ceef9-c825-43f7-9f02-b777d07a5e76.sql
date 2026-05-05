
DROP POLICY IF EXISTS "Company owners can manage roles" ON public.user_roles;

CREATE POLICY "Company owners can manage roles for their employees"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.company_owner_id = auth.uid()
      AND employees.auth_user_id = user_roles.user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.company_owner_id = auth.uid()
      AND employees.auth_user_id = user_roles.user_id
  )
);
