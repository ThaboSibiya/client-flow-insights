-- Fix RLS Performance Issues by optimizing auth function calls
-- Replace auth.uid() with (select auth.uid()) to evaluate once per query instead of once per row

-- Fix customers table policies
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

CREATE POLICY "Users can view their own customers" 
  ON public.customers 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own customers" 
  ON public.customers 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own customers" 
  ON public.customers 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING ((select auth.uid()) = id);

-- Fix tickets table policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON public.tickets;

CREATE POLICY "Users can view their own tickets" 
  ON public.tickets 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own tickets" 
  ON public.tickets 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own tickets" 
  ON public.tickets 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tickets" 
  ON public.tickets 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix ticket_attachments table policies
DROP POLICY IF EXISTS "Users can view ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can create ticket attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can delete their ticket attachments" ON public.ticket_attachments;

CREATE POLICY "Users can view ticket attachments" 
  ON public.ticket_attachments 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create ticket attachments" 
  ON public.ticket_attachments 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their ticket attachments" 
  ON public.ticket_attachments 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix ticket_comments table policies
DROP POLICY IF EXISTS "Users can view ticket comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can create ticket comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can update their ticket comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can delete their ticket comments" ON public.ticket_comments;

CREATE POLICY "Users can view ticket comments" 
  ON public.ticket_comments 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create ticket comments" 
  ON public.ticket_comments 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their ticket comments" 
  ON public.ticket_comments 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their ticket comments" 
  ON public.ticket_comments 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Fix employees table policies
DROP POLICY IF EXISTS "Enable select for company owners" ON public.employees;
DROP POLICY IF EXISTS "Enable insert for company owners" ON public.employees;
DROP POLICY IF EXISTS "Enable update for company owners" ON public.employees;
DROP POLICY IF EXISTS "Enable delete for company owners" ON public.employees;

CREATE POLICY "Enable select for company owners"
  ON public.employees
  FOR SELECT
  USING (company_owner_id = (select auth.uid()));

CREATE POLICY "Enable insert for company owners"
  ON public.employees
  FOR INSERT
  WITH CHECK (company_owner_id = (select auth.uid()));

CREATE POLICY "Enable update for company owners"
  ON public.employees
  FOR UPDATE
  USING (company_owner_id = (select auth.uid()));

CREATE POLICY "Enable delete for company owners"
  ON public.employees
  FOR DELETE
  USING (company_owner_id = (select auth.uid()));

-- Fix conversations table policies
DROP POLICY IF EXISTS "Company owners can manage their conversations" ON public.conversations;

CREATE POLICY "Company owners can manage their conversations"
  ON public.conversations
  FOR ALL
  USING (company_owner_id = (select auth.uid()));

-- Fix messages table policies
DROP POLICY IF EXISTS "Company owners can manage messages in their conversations" ON public.messages;

CREATE POLICY "Company owners can manage messages in their conversations"
  ON public.messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.company_owner_id = (select auth.uid())
    )
  );

-- Fix form_submissions table policies
DROP POLICY IF EXISTS "Company owners can manage their form submissions" ON public.form_submissions;

CREATE POLICY "Company owners can manage their form submissions"
  ON public.form_submissions
  FOR ALL
  USING (company_owner_id = (select auth.uid()));

-- Fix notification_preferences table policies
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can create their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can view their own notification preferences" 
  ON public.notification_preferences 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own notification preferences" 
  ON public.notification_preferences 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notification preferences" 
  ON public.notification_preferences 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

-- Fix quotes_invoices table policies
DROP POLICY IF EXISTS "Users can manage their own quotes and invoices" ON public.quotes_invoices;

CREATE POLICY "Users can manage their own quotes and invoices"
  ON public.quotes_invoices
  FOR ALL
  USING ((select auth.uid()) = user_id);

-- Fix quote_invoice_items table policies
DROP POLICY IF EXISTS "Users can manage their own quote and invoice items" ON public.quote_invoice_items;

CREATE POLICY "Users can manage their own quote and invoice items"
  ON public.quote_invoice_items
  FOR ALL
  USING ((select auth.uid()) = user_id);

-- Fix automation_settings table policies
DROP POLICY IF EXISTS "Users can view their own automation settings" ON public.automation_settings;
DROP POLICY IF EXISTS "Users can insert their own automation settings" ON public.automation_settings;
DROP POLICY IF EXISTS "Users can update their own automation settings" ON public.automation_settings;
DROP POLICY IF EXISTS "Users can delete their own automation settings" ON public.automation_settings;

CREATE POLICY "Users can view their own automation settings"
  ON public.automation_settings FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own automation settings"
  ON public.automation_settings FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own automation settings"
  ON public.automation_settings FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own automation settings"
  ON public.automation_settings FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Fix knowledge_base_files table policies
DROP POLICY IF EXISTS "Users can view their own knowledge base files" ON public.knowledge_base_files;
DROP POLICY IF EXISTS "Users can insert their own knowledge base files" ON public.knowledge_base_files;
DROP POLICY IF EXISTS "Users can delete their own knowledge base files" ON public.knowledge_base_files;

CREATE POLICY "Users can view their own knowledge base files"
  ON public.knowledge_base_files FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own knowledge base files"
  ON public.knowledge_base_files FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own knowledge base files"
  ON public.knowledge_base_files FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Fix scheduled_calls table policies
DROP POLICY IF EXISTS "Users can view their own scheduled calls" ON public.scheduled_calls;
DROP POLICY IF EXISTS "Users can create their own scheduled calls" ON public.scheduled_calls;
DROP POLICY IF EXISTS "Users can update their own scheduled calls" ON public.scheduled_calls;
DROP POLICY IF EXISTS "Users can delete their own scheduled calls" ON public.scheduled_calls;

CREATE POLICY "Users can view their own scheduled calls" 
  ON public.scheduled_calls 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can create their own scheduled calls" 
  ON public.scheduled_calls 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can update their own scheduled calls" 
  ON public.scheduled_calls 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can delete their own scheduled calls" 
  ON public.scheduled_calls 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = (select auth.uid())
  ));

-- Fix employee_privileges table policies
DROP POLICY IF EXISTS "Company owners can manage all privileges" ON public.employee_privileges;
DROP POLICY IF EXISTS "Employees can view their own privileges" ON public.employee_privileges;

CREATE POLICY "Company owners can manage all privileges" 
  ON public.employee_privileges 
  FOR ALL 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.company_owner_id = (select auth.uid())
  ));

CREATE POLICY "Employees can view their own privileges" 
  ON public.employee_privileges 
  FOR SELECT 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.user_id = (select auth.uid())
  ));

-- Fix employee_attendance table policies
DROP POLICY IF EXISTS "Company owners can view all attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "Employees can manage their own attendance" ON public.employee_attendance;

CREATE POLICY "Company owners can view all attendance" 
  ON public.employee_attendance 
  FOR ALL 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.company_owner_id = (select auth.uid())
  ));

CREATE POLICY "Employees can manage their own attendance" 
  ON public.employee_attendance 
  FOR ALL 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.user_id = (select auth.uid())
  ));

-- Fix ticket_satisfaction table policies
DROP POLICY IF EXISTS "Users can view satisfaction ratings for their tickets" ON public.ticket_satisfaction;
DROP POLICY IF EXISTS "Users can create satisfaction ratings for their tickets" ON public.ticket_satisfaction;

CREATE POLICY "Users can view satisfaction ratings for their tickets" 
  ON public.ticket_satisfaction 
  FOR SELECT 
  USING (EXISTS ( 
    SELECT 1
    FROM tickets
    WHERE tickets.id = ticket_satisfaction.ticket_id 
    AND tickets.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can create satisfaction ratings for their tickets" 
  ON public.ticket_satisfaction 
  FOR INSERT 
  WITH CHECK (EXISTS ( 
    SELECT 1
    FROM tickets
    WHERE tickets.id = ticket_satisfaction.ticket_id 
    AND tickets.user_id = (select auth.uid())
  ));

-- Fix ticket_activities table policies
DROP POLICY IF EXISTS "Users can view activities for their tickets" ON public.ticket_activities;
DROP POLICY IF EXISTS "Users can create activities for their tickets" ON public.ticket_activities;

CREATE POLICY "Users can view activities for their tickets" 
  ON public.ticket_activities 
  FOR SELECT 
  USING (EXISTS ( 
    SELECT 1
    FROM tickets
    WHERE tickets.id = ticket_activities.ticket_id 
    AND tickets.user_id = (select auth.uid())
  ));

CREATE POLICY "Users can create activities for their tickets" 
  ON public.ticket_activities 
  FOR INSERT 
  WITH CHECK (EXISTS ( 
    SELECT 1
    FROM tickets
    WHERE tickets.id = ticket_activities.ticket_id 
    AND tickets.user_id = (select auth.uid())
  ));

-- Fix employee_login_history table policies
DROP POLICY IF EXISTS "Admins can view login history" ON public.employee_login_history;
DROP POLICY IF EXISTS "Employees can insert their own login records" ON public.employee_login_history;

CREATE POLICY "Admins can view login history"
  ON public.employee_login_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.employees
      WHERE employees.user_id = (select auth.uid()) AND employees.role = 'admin'
    )
  );

CREATE POLICY "Employees can insert their own login records"
  ON public.employee_login_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.employees
      WHERE employees.id = employee_login_history.employee_id AND employees.user_id = (select auth.uid())
    )
  );

-- Fix file_access_history table policies
DROP POLICY IF EXISTS "Admins can view file access history" ON public.file_access_history;
DROP POLICY IF EXISTS "Employees can log their own file access" ON public.file_access_history;

CREATE POLICY "Admins can view file access history"
  ON public.file_access_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM employees
      WHERE employees.user_id = (select auth.uid()) AND employees.role = 'admin'
    )
  );

CREATE POLICY "Employees can log their own file access"
  ON public.file_access_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM employees
      WHERE employees.id = file_access_history.employee_id AND employees.user_id = (select auth.uid())
    )
  );

-- Fix job_completions table policies
DROP POLICY IF EXISTS "Employees can manage job completions for their company" ON public.job_completions;

CREATE POLICY "Employees can manage job completions for their company" 
  ON public.job_completions
  FOR ALL
  USING ((
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.user_id = (select auth.uid())
      AND e.id = job_completions.employee_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.employees e ON c.user_id = e.company_owner_id
      WHERE c.id = job_completions.customer_id
      AND e.user_id = (select auth.uid())
    )
  ));

-- Fix automation_permissions table policies
DROP POLICY IF EXISTS "Company owners can manage automation permissions" ON public.automation_permissions;
DROP POLICY IF EXISTS "Employees can view their automation permissions" ON public.automation_permissions;

CREATE POLICY "Company owners can manage automation permissions" 
  ON public.automation_permissions 
  FOR ALL 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.company_owner_id = (select auth.uid())
  ));

CREATE POLICY "Employees can view their automation permissions" 
  ON public.automation_permissions 
  FOR SELECT 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.user_id = (select auth.uid())
  ));

-- Fix privilege_change_audit table policies
DROP POLICY IF EXISTS "Company owners can view privilege audit logs" ON public.privilege_change_audit;

CREATE POLICY "Company owners can view privilege audit logs" 
  ON public.privilege_change_audit 
  FOR SELECT 
  USING (employee_id IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.company_owner_id = (select auth.uid())
  ));

-- Fix employee_invitations table policies
DROP POLICY IF EXISTS "Company owners can manage invitations" ON public.employee_invitations;

CREATE POLICY "Company owners can manage invitations" 
  ON public.employee_invitations 
  FOR ALL 
  USING (created_by IN ( 
    SELECT employees.id
    FROM employees
    WHERE employees.company_owner_id = (select auth.uid())
  ));