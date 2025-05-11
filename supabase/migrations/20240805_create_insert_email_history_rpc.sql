
-- Create an RPC function to insert email history records
CREATE OR REPLACE FUNCTION public.insert_email_history(
  p_customer_id UUID,
  p_sender TEXT,
  p_subject TEXT,
  p_message TEXT,
  p_attachments TEXT[] DEFAULT NULL,
  p_status TEXT DEFAULT 'sent'
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
