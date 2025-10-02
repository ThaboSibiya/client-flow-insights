-- Enhanced Audit Logging for Employee Role Changes

-- Create trigger function to log employee role changes
CREATE OR REPLACE FUNCTION public.log_employee_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Insert into security_audit_logs
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      success,
      metadata
    ) VALUES (
      auth.uid(),
      'employee_role_changed',
      'employee',
      NEW.id::text,
      true,
      jsonb_build_object(
        'employee_id', NEW.id,
        'employee_email', NEW.email,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid(),
        'timestamp', now()
      )
    );

    -- Also log to security_events for monitoring
    INSERT INTO public.security_events (
      user_id,
      event_type,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      'role_escalation',
      'employee',
      NEW.id::text,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'severity', CASE 
          WHEN NEW.role = 'admin' THEN 'high'
          WHEN NEW.role = 'manager' THEN 'medium'
          ELSE 'low'
        END
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on employees table
DROP TRIGGER IF EXISTS employee_role_change_audit ON public.employees;
CREATE TRIGGER employee_role_change_audit
  AFTER UPDATE ON public.employees
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_employee_role_change();

-- Add index for better query performance on security events
CREATE INDEX IF NOT EXISTS idx_security_events_event_type 
  ON public.security_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action 
  ON public.security_audit_logs(action, timestamp DESC);

-- Add helpful comment
COMMENT ON TRIGGER employee_role_change_audit ON public.employees IS 
  'Automatically logs all employee role changes to security_audit_logs and security_events tables for compliance and security monitoring';
