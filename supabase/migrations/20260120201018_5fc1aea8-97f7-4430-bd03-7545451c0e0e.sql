-- Create trigger function for ticket notifications
CREATE OR REPLACE FUNCTION public.notify_on_ticket_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_name TEXT;
  v_owner_id UUID;
BEGIN
  -- Get customer info
  SELECT name, user_id INTO v_customer_name, v_owner_id
  FROM customers WHERE id = NEW.customer_id;
  
  -- Only notify if user has ticket notifications enabled
  IF EXISTS (
    SELECT 1 FROM notification_preferences 
    WHERE user_id = v_owner_id 
    AND ticket_notifications = false
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'ticket',
      'New Support Ticket',
      'Ticket "' || COALESCE(NEW.subject, 'Untitled') || '" created for ' || COALESCE(v_customer_name, 'Unknown') || '.',
      '/pipeline',
      jsonb_build_object('ticket_id', NEW.id, 'customer_id', NEW.customer_id, 'priority', NEW.priority)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Status change notification
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
      VALUES (
        NEW.user_id,
        'ticket',
        'Ticket Status Updated',
        'Ticket "' || COALESCE(NEW.subject, 'Untitled') || '" is now ' || NEW.status || '.',
        '/pipeline',
        jsonb_build_object('ticket_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    -- Assignment notification
    IF OLD.assigned_to_id IS DISTINCT FROM NEW.assigned_to_id AND NEW.assigned_to_id IS NOT NULL THEN
      INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
      VALUES (
        NEW.assigned_to_id,
        'ticket',
        'Ticket Assigned to You',
        'You have been assigned ticket "' || COALESCE(NEW.subject, 'Untitled') || '".',
        '/pipeline',
        jsonb_build_object('ticket_id', NEW.id, 'priority', NEW.priority)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tickets (correct table name)
DROP TRIGGER IF EXISTS trigger_ticket_notification ON tickets;
CREATE TRIGGER trigger_ticket_notification
  AFTER INSERT OR UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_ticket_change();