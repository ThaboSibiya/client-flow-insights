-- Drop the overly permissive template visibility policy
DROP POLICY IF EXISTS "Users can view their own industry templates" ON public.industry_templates;

-- Create a restrictive policy - users can only see their own templates
CREATE POLICY "Users can view only their own templates"
ON public.industry_templates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure company owners can still manage their templates
-- The other policies (INSERT, UPDATE, DELETE) already have correct restrictions