
-- Fix Function Search Path Mutable warnings by setting search_path for all functions

-- 1. Fix log_privilege_change function
CREATE OR REPLACE FUNCTION public.log_privilege_change(p_employee_id uuid, p_privilege_name text, p_old_value boolean, p_new_value boolean, p_reason text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.privilege_change_audit (
    employee_id, changed_by, privilege_name, old_value, new_value, reason
  ) VALUES (
    p_employee_id, auth.uid(), p_privilege_name, p_old_value, p_new_value, p_reason
  );
END;
$function$;

-- 2. Fix set_employee_number function
CREATE OR REPLACE FUNCTION public.set_employee_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
        NEW.employee_number := generate_employee_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

-- 3. Fix update_conversation_last_message function
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- 4. Fix generate_employee_number function
CREATE OR REPLACE FUNCTION public.generate_employee_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    next_number INTEGER;
    employee_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.employees
    WHERE employee_number LIKE 'EMP%';
    
    employee_number := 'EMP' || LPAD(next_number::TEXT, 4, '0');
    RETURN employee_number;
END;
$function$;

-- 5. Fix calculate_resolution_time function
CREATE OR REPLACE FUNCTION public.calculate_resolution_time()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- If status changed to 'resolved' or 'closed', calculate resolution time
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = CURRENT_TIMESTAMP;
    NEW.resolution_time_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.created_at)) / 60;
  END IF;
  
  -- If status changed to 'closed', set closed_at
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = CURRENT_TIMESTAMP;
  END IF;
  
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$;

-- 6. Fix get_email_history function
CREATE OR REPLACE FUNCTION public.get_email_history(customer_id_param uuid)
 RETURNS SETOF email_history
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM email_history
  WHERE customer_id = customer_id_param
  ORDER BY created_at DESC;
END;
$function$;

-- 7. Fix insert_email_history function
CREATE OR REPLACE FUNCTION public.insert_email_history(p_customer_id uuid, p_sender text, p_subject text, p_message text, p_attachments text[] DEFAULT NULL::text[], p_status text DEFAULT 'sent'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.email_history(
    customer_id, sender, subject, message, attachments, status
  ) VALUES (
    p_customer_id, p_sender, p_subject, p_message, p_attachments, p_status
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$function$;
