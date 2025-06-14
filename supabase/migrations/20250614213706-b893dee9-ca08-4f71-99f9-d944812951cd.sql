
-- Drop all existing policies on the employees table to clear any conflicts
DROP POLICY IF EXISTS "Company owners can view their employees" ON public.employees;
DROP POLICY IF EXISTS "Company owners can create employees" ON public.employees;
DROP POLICY IF EXISTS "Company owners can update their employees" ON public.employees;
DROP POLICY IF EXISTS "Company owners can delete their employees" ON public.employees;
DROP POLICY IF EXISTS "Company owners can manage all employees" ON public.employees;
DROP POLICY IF EXISTS "Employees can view their own record" ON public.employees;
DROP POLICY IF EXISTS "Managers can view their team members" ON public.employees;

-- Recreate clean, simple policies
CREATE POLICY "Enable select for company owners"
  ON public.employees
  FOR SELECT
  USING (company_owner_id = auth.uid());

CREATE POLICY "Enable insert for company owners"
  ON public.employees
  FOR INSERT
  WITH CHECK (company_owner_id = auth.uid());

CREATE POLICY "Enable update for company owners"
  ON public.employees
  FOR UPDATE
  USING (company_owner_id = auth.uid());

CREATE POLICY "Enable delete for company owners"
  ON public.employees
  FOR DELETE
  USING (company_owner_id = auth.uid());
