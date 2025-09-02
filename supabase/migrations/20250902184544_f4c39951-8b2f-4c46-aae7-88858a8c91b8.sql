-- Fix all remaining functions that don't have search_path set
-- First, let's check and fix functions that trigger the warning

-- Fix the check_rate_limit function with proper variable naming
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

-- Fix other functions that might not have search_path
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_employee_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    next_number INTEGER;
    employee_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(e.employee_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.employees e
    WHERE e.employee_number LIKE 'EMP%';
    
    employee_number := 'EMP' || LPAD(next_number::TEXT, 4, '0');
    RETURN employee_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
        NEW.employee_number := generate_employee_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;