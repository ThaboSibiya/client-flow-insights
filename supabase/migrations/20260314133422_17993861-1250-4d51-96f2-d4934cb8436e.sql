
-- Workspace-scoped RLS policies

-- CUSTOMERS
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

CREATE POLICY "Workspace members can view customers"
  ON public.customers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert customers"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update customers"
  ON public.customers FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete customers"
  ON public.customers FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- TICKETS
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON public.tickets;

CREATE POLICY "Workspace members can view tickets"
  ON public.tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert tickets"
  ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update tickets"
  ON public.tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete tickets"
  ON public.tickets FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- INVOICES
DROP POLICY IF EXISTS "Finance users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Finance admins can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Finance admins can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Finance admins can delete invoices" ON public.invoices;

CREATE POLICY "Workspace members can view invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert invoices"
  ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update invoices"
  ON public.invoices FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete invoices"
  ON public.invoices FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- PAYMENTS
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their payments" ON public.payments;

CREATE POLICY "Workspace members can view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete payments"
  ON public.payments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- CONVERSATIONS
DROP POLICY IF EXISTS "Company owners can manage their conversations" ON public.conversations;

CREATE POLICY "Workspace members can manage conversations"
  ON public.conversations FOR ALL TO authenticated
  USING (company_owner_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- QUOTES_INVOICES
DROP POLICY IF EXISTS "Users can manage their own quotes and invoices" ON public.quotes_invoices;

CREATE POLICY "Workspace members can view quotes_invoices"
  ON public.quotes_invoices FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert quotes_invoices"
  ON public.quotes_invoices FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update quotes_invoices"
  ON public.quotes_invoices FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete quotes_invoices"
  ON public.quotes_invoices FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- EMPLOYEES
DROP POLICY IF EXISTS "Company owners can manage their employees" ON public.employees;

CREATE POLICY "Workspace members can manage employees"
  ON public.employees FOR ALL TO authenticated
  USING (company_owner_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (company_owner_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

-- PROJECTS
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Workspace members can view projects"
  ON public.projects FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)));

CREATE POLICY "Workspace members can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_workspace_member(auth.uid(), workspace_id));
