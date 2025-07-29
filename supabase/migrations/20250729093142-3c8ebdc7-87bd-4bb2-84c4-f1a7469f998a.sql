
-- Fix the search_path security warning for update_email_thread_stats function
CREATE OR REPLACE FUNCTION public.update_email_thread_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update thread stats when email is inserted or updated
  UPDATE public.email_threads 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
    ),
    unread_count = (
      SELECT COUNT(*) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id) 
      AND is_read = false
    ),
    last_message_at = (
      SELECT MAX(message_date) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
