
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
