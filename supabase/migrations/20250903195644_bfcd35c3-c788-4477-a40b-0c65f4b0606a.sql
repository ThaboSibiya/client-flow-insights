-- Security Fix Migration: Address Critical Vulnerabilities (Fixed)

-- 1. Fix employees table UPDATE policy to prevent privilege escalation
DROP POLICY IF EXISTS "Employees can update their login time" ON employees;

CREATE POLICY "Employees can only update their login time" 
ON employees 
FOR UPDATE 
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Create a trigger function to validate employee updates
CREATE OR REPLACE FUNCTION validate_employee_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only allow updating last_login_at and updated_at fields
  IF (
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.employee_number IS DISTINCT FROM NEW.employee_number OR
    OLD.designation IS DISTINCT FROM NEW.designation OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.department IS DISTINCT FROM NEW.department OR
    OLD.phone IS DISTINCT FROM NEW.phone OR
    OLD.role IS DISTINCT FROM NEW.role OR
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.hire_date IS DISTINCT FROM NEW.hire_date OR
    OLD.salary IS DISTINCT FROM NEW.salary OR
    OLD.manager_id IS DISTINCT FROM NEW.manager_id OR
    OLD.company_owner_id IS DISTINCT FROM NEW.company_owner_id OR
    OLD.user_id IS DISTINCT FROM NEW.user_id OR
    OLD.auth_user_id IS DISTINCT FROM NEW.auth_user_id OR
    OLD.is_invited IS DISTINCT FROM NEW.is_invited OR
    OLD.invitation_sent_at IS DISTINCT FROM NEW.invitation_sent_at OR
    OLD.invitation_expires_at IS DISTINCT FROM NEW.invitation_expires_at OR
    OLD.invitation_token IS DISTINCT FROM NEW.invitation_token
  ) THEN
    -- Only company owners can modify these fields
    IF NOT EXISTS (
      SELECT 1 FROM employees 
      WHERE id = NEW.id AND company_owner_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Employees can only update their login time. Other changes require company owner privileges.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS employee_update_validation ON employees;

-- Create the trigger
CREATE TRIGGER employee_update_validation
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION validate_employee_update();

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