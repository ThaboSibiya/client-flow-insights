-- Update RLS policy to allow viewing system templates (where user_id is NULL)
DROP POLICY IF EXISTS "Users can view their own industry templates" ON public.industry_templates;

CREATE POLICY "Users can view their own industry templates" 
ON public.industry_templates
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);