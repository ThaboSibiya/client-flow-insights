-- Fix function search path security warning
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