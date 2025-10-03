-- Drop the overly permissive employee update policy
DROP POLICY IF EXISTS "Employees can only update their login time" ON public.employees;

-- Create a restrictive policy that only allows updating login time
CREATE POLICY "Employees can only update login timestamp"
ON public.employees
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
  auth_user_id = auth.uid() AND
  -- Ensure all sensitive fields remain unchanged
  first_name = (SELECT first_name FROM employees WHERE id = employees.id) AND
  last_name = (SELECT last_name FROM employees WHERE id = employees.id) AND
  email = (SELECT email FROM employees WHERE id = employees.id) AND
  employee_number = (SELECT employee_number FROM employees WHERE id = employees.id) AND
  designation = (SELECT designation FROM employees WHERE id = employees.id) AND
  title = (SELECT title FROM employees WHERE id = employees.id) AND
  department IS NOT DISTINCT FROM (SELECT department FROM employees WHERE id = employees.id) AND
  phone IS NOT DISTINCT FROM (SELECT phone FROM employees WHERE id = employees.id) AND
  role = (SELECT role FROM employees WHERE id = employees.id) AND
  status = (SELECT status FROM employees WHERE id = employees.id) AND
  hire_date = (SELECT hire_date FROM employees WHERE id = employees.id) AND
  salary IS NOT DISTINCT FROM (SELECT salary FROM employees WHERE id = employees.id) AND
  manager_id IS NOT DISTINCT FROM (SELECT manager_id FROM employees WHERE id = employees.id) AND
  company_owner_id = (SELECT company_owner_id FROM employees WHERE id = employees.id) AND
  user_id = (SELECT user_id FROM employees WHERE id = employees.id) AND
  auth_user_id = (SELECT auth_user_id FROM employees WHERE id = employees.id) AND
  is_invited = (SELECT is_invited FROM employees WHERE id = employees.id) AND
  invitation_sent_at IS NOT DISTINCT FROM (SELECT invitation_sent_at FROM employees WHERE id = employees.id) AND
  invitation_expires_at IS NOT DISTINCT FROM (SELECT invitation_expires_at FROM employees WHERE id = employees.id) AND
  invitation_token IS NOT DISTINCT FROM (SELECT invitation_token FROM employees WHERE id = employees.id)
);