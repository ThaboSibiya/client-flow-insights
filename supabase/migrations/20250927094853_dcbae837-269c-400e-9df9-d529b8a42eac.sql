-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION refresh_customer_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For INSERT, UPDATE, or DELETE on customers table
  -- This will trigger real-time notifications
  RETURN COALESCE(NEW, OLD);
END;
$$;