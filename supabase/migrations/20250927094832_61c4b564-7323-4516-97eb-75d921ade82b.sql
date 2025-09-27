-- Ensure the customers table has proper real-time setup
ALTER TABLE customers REPLICA IDENTITY FULL;

-- Verify the table is in the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  END IF;
END
$$;

-- Create a function to refresh customer data when needed
CREATE OR REPLACE FUNCTION refresh_customer_data()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT, UPDATE, or DELETE on customers table
  -- This will trigger real-time notifications
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure real-time updates
DROP TRIGGER IF EXISTS customer_data_refresh_trigger ON customers;
CREATE TRIGGER customer_data_refresh_trigger
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION refresh_customer_data();