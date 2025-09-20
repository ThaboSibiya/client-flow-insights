-- Create efficient security definer function for current user ID
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT auth.uid();
$function$;

-- Update company_settings RLS policies to use the efficient function
DROP POLICY IF EXISTS "Users can delete their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can insert their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update their own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can view their own company settings" ON public.company_settings;

CREATE POLICY "Users can delete their own company settings" 
ON public.company_settings 
FOR DELETE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own company settings" 
ON public.company_settings 
FOR INSERT 
WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own company settings" 
ON public.company_settings 
FOR UPDATE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can view their own company settings" 
ON public.company_settings 
FOR SELECT 
USING (current_user_id() = user_id);

-- Update customer_custom_data RLS policies to use the efficient function
DROP POLICY IF EXISTS "Users can create their customer custom data" ON public.customer_custom_data;
DROP POLICY IF EXISTS "Users can delete their customer custom data" ON public.customer_custom_data;
DROP POLICY IF EXISTS "Users can update their customer custom data" ON public.customer_custom_data;
DROP POLICY IF EXISTS "Users can view their customer custom data" ON public.customer_custom_data;

CREATE POLICY "Users can create their customer custom data" 
ON public.customer_custom_data 
FOR INSERT 
WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can delete their customer custom data" 
ON public.customer_custom_data 
FOR DELETE 
USING (user_id = current_user_id());

CREATE POLICY "Users can update their customer custom data" 
ON public.customer_custom_data 
FOR UPDATE 
USING (user_id = current_user_id());

CREATE POLICY "Users can view their customer custom data" 
ON public.customer_custom_data 
FOR SELECT 
USING (user_id = current_user_id());