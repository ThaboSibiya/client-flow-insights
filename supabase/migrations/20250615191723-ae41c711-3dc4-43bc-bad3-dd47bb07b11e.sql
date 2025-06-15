
-- Create RPC function to get email history
CREATE OR REPLACE FUNCTION public.get_email_history(customer_id_param UUID)
RETURNS SETOF email_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM email_history
  WHERE customer_id = customer_id_param
  ORDER BY created_at DESC;
END;
$$;

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

-- Grant permissions for authenticated users to execute database functions
GRANT EXECUTE ON FUNCTION public.get_email_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_email_history(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT) TO authenticated;
