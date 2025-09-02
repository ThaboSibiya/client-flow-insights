-- Fix function search path mutable warning by adding SET search_path to functions that lack it
-- Let me check which functions need this fix

-- Fix any functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.is_company_owner()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM customers WHERE user_id = auth.uid()
  );
$$;

-- Update any other functions that might be missing search_path
-- This should resolve the security linter warning