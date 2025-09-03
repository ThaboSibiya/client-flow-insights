-- Security Fix Migration: Address Critical Vulnerabilities

-- 1. Fix employees table UPDATE policy to prevent privilege escalation
DROP POLICY IF EXISTS "Employees can update their login time" ON employees;

CREATE POLICY "Employees can only update their login time" 
ON employees 
FOR UPDATE 
USING (auth_user_id = auth.uid())
WITH CHECK (
  auth_user_id = auth.uid() AND 
  -- Only allow updating last_login_at, no other fields
  (
    (OLD.first_name = NEW.first_name) AND
    (OLD.last_name = NEW.last_name) AND
    (OLD.email = NEW.email) AND
    (OLD.employee_number = NEW.employee_number) AND
    (OLD.designation = NEW.designation) AND
    (OLD.title = NEW.title) AND
    (OLD.department = NEW.department) AND
    (OLD.phone = NEW.phone) AND
    (OLD.role = NEW.role) AND
    (OLD.status = NEW.status) AND
    (OLD.hire_date = NEW.hire_date) AND
    (OLD.salary = NEW.salary) AND
    (OLD.manager_id = NEW.manager_id) AND
    (OLD.company_owner_id = NEW.company_owner_id) AND
    (OLD.user_id = NEW.user_id) AND
    (OLD.auth_user_id = NEW.auth_user_id) AND
    (OLD.is_invited = NEW.is_invited) AND
    (OLD.invitation_sent_at = NEW.invitation_sent_at) AND
    (OLD.invitation_expires_at = NEW.invitation_expires_at) AND
    (OLD.invitation_token = NEW.invitation_token)
  )
);

-- 2. Create security_events table with proper RLS
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security_events
CREATE POLICY "Company owners can view security events for their employees"
ON security_events
FOR SELECT
USING (
  -- User can see their own events
  user_id = auth.uid() OR
  -- Company owners can see events for their employees
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.auth_user_id = security_events.user_id 
    AND e.company_owner_id = auth.uid()
  ) OR
  -- Company owners can see their own events
  EXISTS (
    SELECT 1 FROM customers c 
    WHERE c.user_id = auth.uid() 
    AND security_events.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own security events"
ON security_events
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 3. Fix check_rate_limit function logic
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_resource text, 
  p_max_attempts integer DEFAULT 5, 
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries first
  DELETE FROM rate_limiting 
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND window_start < window_start_time;
  
  -- Get current count within the window
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_count
  FROM rate_limiting
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND window_start >= window_start_time;
  
  -- Check if limit would be exceeded with this attempt
  IF current_count >= p_max_attempts THEN
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO rate_limiting (user_id, identifier, resource, attempt_count, window_start)
  VALUES (auth.uid(), auth.uid()::text, p_resource, 1, now())
  ON CONFLICT (user_id, resource, window_start) 
  DO UPDATE SET 
    attempt_count = rate_limiting.attempt_count + 1,
    created_at = now();
  
  -- Check again after incrementing
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_count
  FROM rate_limiting
  WHERE user_id = auth.uid() 
    AND resource = p_resource 
    AND window_start >= window_start_time;
    
  RETURN current_count <= p_max_attempts;
END;
$function$;

-- 4. Create secure audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_event_data jsonb DEFAULT '{}',
  p_ip_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_events (user_id, event_type, event_data, ip_address)
  VALUES (auth.uid(), p_event_type, p_event_data, p_ip_address::inet)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- 5. Create employee privilege validation function
CREATE OR REPLACE FUNCTION public.validate_employee_privilege_access(
  p_employee_id uuid,
  p_privilege_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if the current user is the company owner for this employee
  IF NOT is_company_owner_for_employee(p_employee_id) THEN
    -- Log unauthorized access attempt
    PERFORM log_security_event(
      'unauthorized_privilege_access_attempt',
      jsonb_build_object(
        'employee_id', p_employee_id,
        'privilege_name', p_privilege_name,
        'attempted_by', auth.uid()
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;