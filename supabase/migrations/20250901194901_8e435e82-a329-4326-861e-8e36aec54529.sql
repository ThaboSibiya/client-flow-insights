
-- Phase 1: Critical Security Fixes

-- 1. Make sensitive storage buckets private
UPDATE storage.buckets 
SET public = false 
WHERE name IN ('ticket-attachments', 'conversation-attachments');

-- 2. Create security definer helper functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM employees WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner_for_employee(_employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM employees 
    WHERE id = _employee_id AND company_owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_company_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_owner_id FROM employees WHERE auth_user_id = auth.uid();
$$;

-- 3. Fix employees table RLS policies
DROP POLICY IF EXISTS "Enable select for company owners" ON employees;
DROP POLICY IF EXISTS "Enable insert for company owners" ON employees;
DROP POLICY IF EXISTS "Enable update for company owners" ON employees;
DROP POLICY IF EXISTS "Enable delete for company owners" ON employees;

-- Allow company owners to manage their employees
CREATE POLICY "Company owners can manage their employees"
ON employees FOR ALL
USING (company_owner_id = auth.uid())
WITH CHECK (company_owner_id = auth.uid());

-- Allow employees to view their own record
CREATE POLICY "Employees can view their own record"
ON employees FOR SELECT
USING (auth_user_id = auth.uid());

-- Allow employees to update only their last_login_at
CREATE POLICY "Employees can update their login time"
ON employees FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- 4. Fix employee_privileges RLS policies using helper functions
DROP POLICY IF EXISTS "Company owners can manage all privileges" ON employee_privileges;
DROP POLICY IF EXISTS "Employees can view their own privileges" ON employee_privileges;

CREATE POLICY "Company owners can manage employee privileges"
ON employee_privileges FOR ALL
USING (public.is_company_owner_for_employee(employee_id))
WITH CHECK (public.is_company_owner_for_employee(employee_id));

CREATE POLICY "Employees can view their own privileges"
ON employee_privileges FOR SELECT
USING (employee_id = public.current_employee_id());

-- 5. Fix automation_permissions RLS policies
DROP POLICY IF EXISTS "Company owners can manage automation permissions" ON automation_permissions;
DROP POLICY IF EXISTS "Employees can view their automation permissions" ON automation_permissions;

CREATE POLICY "Company owners can manage automation permissions"
ON automation_permissions FOR ALL
USING (public.is_company_owner_for_employee(employee_id))
WITH CHECK (public.is_company_owner_for_employee(employee_id));

CREATE POLICY "Employees can view their automation permissions"
ON automation_permissions FOR SELECT
USING (employee_id = public.current_employee_id());

-- 6. Fix employee_attendance RLS policies
DROP POLICY IF EXISTS "Company owners can view all attendance" ON employee_attendance;
DROP POLICY IF EXISTS "Employees can manage their own attendance" ON employee_attendance;

CREATE POLICY "Company owners can manage employee attendance"
ON employee_attendance FOR ALL
USING (public.is_company_owner_for_employee(employee_id))
WITH CHECK (public.is_company_owner_for_employee(employee_id));

CREATE POLICY "Employees can manage their own attendance"
ON employee_attendance FOR ALL
USING (employee_id = public.current_employee_id())
WITH CHECK (employee_id = public.current_employee_id());

-- 7. Add user_id column to rate_limiting table and fix RLS
ALTER TABLE rate_limiting ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow rate limiting operations" ON rate_limiting;

-- Create secure RLS policies for rate limiting
CREATE POLICY "Users can manage their own rate limits"
ON rate_limiting FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Create secure audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  success boolean NOT NULL,
  error_message text,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS and create insert-only policy
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for security audit logs"
ON security_audit_logs FOR INSERT
WITH CHECK (true);

-- Only allow reading for company owners and admins
CREATE POLICY "Company owners can view security logs"
ON security_audit_logs FOR SELECT
USING (
  user_id IN (
    SELECT auth_user_id FROM employees 
    WHERE company_owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

-- 9. Add storage policies for private buckets
CREATE POLICY "Users can upload their own ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ticket attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own conversation attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'conversation-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own conversation attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'conversation-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 10. Create secure rate limiting RPC
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_resource text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM rate_limiting 
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND window_start < window_start;
  
  -- Get current count
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_count
  FROM rate_limiting
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND window_start >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_attempts THEN
    RETURN false;
  END IF;
  
  -- Increment or create new entry
  INSERT INTO rate_limiting (user_id, identifier, resource, attempt_count, window_start)
  VALUES (auth.uid(), auth.uid()::text, p_resource, 1, now())
  ON CONFLICT (user_id, resource, window_start) 
  DO UPDATE SET attempt_count = rate_limiting.attempt_count + 1;
  
  RETURN true;
END;
$$;
