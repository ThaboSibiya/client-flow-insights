-- Fix search path security issue for validate_email_history_ownership function
CREATE OR REPLACE FUNCTION public.validate_email_history_ownership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure the customer belongs to the user inserting/updating the email history
  IF NOT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = NEW.customer_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Email history can only be created for customers owned by the user';
  END IF;
  
  RETURN NEW;
END;
$function$;