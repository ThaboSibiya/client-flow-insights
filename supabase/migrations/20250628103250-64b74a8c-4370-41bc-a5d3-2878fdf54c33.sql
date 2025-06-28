
-- Fix search_path for remaining functions that still have the mutable warning
-- These functions need to have their search_path set to 'public' for security

-- 1. Fix generate_invitation_token function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- 2. Fix create_employee_invitation function
CREATE OR REPLACE FUNCTION public.create_employee_invitation(p_employee_id uuid, p_email text, p_created_by uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_token TEXT;
BEGIN
  v_token := generate_invitation_token();
  
  INSERT INTO public.employee_invitations (
    employee_id, email, invitation_token, created_by
  ) VALUES (
    p_employee_id, p_email, v_token, p_created_by
  );
  
  -- Update employee record
  UPDATE public.employees 
  SET 
    is_invited = true,
    invitation_token = v_token,
    invitation_sent_at = now(),
    invitation_expires_at = now() + interval '7 days'
  WHERE id = p_employee_id;
  
  RETURN v_token;
END;
$function$;

-- 3. Fix validate_invitation_token function
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
 RETURNS TABLE(employee_id uuid, email text, is_valid boolean, employee_data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ei.employee_id,
    ei.email,
    (ei.expires_at > now() AND NOT ei.is_used) AS is_valid,
    jsonb_build_object(
      'first_name', e.first_name,
      'last_name', e.last_name,
      'employee_number', e.employee_number,
      'designation', e.designation,
      'title', e.title,
      'department', e.department,
      'role', e.role
    ) AS employee_data
  FROM public.employee_invitations ei
  JOIN public.employees e ON ei.employee_id = e.id
  WHERE ei.invitation_token = p_token;
END;
$function$;

-- 4. Fix complete_employee_registration function
CREATE OR REPLACE FUNCTION public.complete_employee_registration(p_token text, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_employee_id UUID;
  v_is_valid BOOLEAN;
BEGIN
  -- Validate token and get employee ID
  SELECT employee_id, (expires_at > now() AND NOT is_used)
  INTO v_employee_id, v_is_valid
  FROM public.employee_invitations
  WHERE invitation_token = p_token;
  
  IF NOT v_is_valid OR v_employee_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update employee with auth user ID
  UPDATE public.employees 
  SET 
    auth_user_id = p_user_id,
    last_login_at = now(),
    updated_at = now()
  WHERE id = v_employee_id;
  
  -- Mark invitation as used
  UPDATE public.employee_invitations 
  SET 
    is_used = true,
    accepted_at = now()
  WHERE invitation_token = p_token;
  
  RETURN true;
END;
$function$;

-- 5. Fix handle_new_user function (if it exists and doesn't have search_path set)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$function$;
