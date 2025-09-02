
-- Phase 1: Critical Security Fixes

-- 1. Fix the employees table UPDATE policy to prevent privilege escalation
DROP POLICY IF EXISTS "Employees can update their login time" ON employees;

-- Create a secure RPC for updating login time only
CREATE OR REPLACE FUNCTION public.update_employee_login_time()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE employees 
  SET last_login_at = now(), updated_at = now()
  WHERE auth_user_id = auth.uid();
END;
$$;

-- Create a secure RPC for company owners to update employee login time
CREATE OR REPLACE FUNCTION public.admin_update_employee_login_time(p_employee_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow company owners to update login time for their employees
  IF NOT is_company_owner_for_employee(p_employee_id) THEN
    RAISE EXCEPTION 'Access denied: Not authorized to update this employee';
  END IF;
  
  UPDATE employees 
  SET last_login_at = now(), updated_at = now()
  WHERE id = p_employee_id;
END;
$$;

-- 2. Fix the check_rate_limit RPC logic bug
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_resource text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM rate_limiting 
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND rate_limiting.window_start < window_start_time;
  
  -- Get current count
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_count
  FROM rate_limiting
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND rate_limiting.window_start >= window_start_time;
  
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

-- 3. Enable RLS on security_events table and add policies
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own security events
CREATE POLICY "Users can insert their own security events" 
ON security_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own security events
CREATE POLICY "Users can view their own security events" 
ON security_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for company owners to view security events of their employees
CREATE POLICY "Company owners can view employee security events" 
ON security_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.auth_user_id = security_events.user_id 
    AND e.company_owner_id = auth.uid()
  )
);

-- 4. Create secure edge function for API key management
-- This will be handled in the code phase

-- 5. Add search_path to existing SECURITY DEFINER functions that lack it
CREATE OR REPLACE FUNCTION public.is_company_owner_for_employee(_employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
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
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_owner_id FROM employees WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM employees WHERE auth_user_id = auth.uid();
$$;
