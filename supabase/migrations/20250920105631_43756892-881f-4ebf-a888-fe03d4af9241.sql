-- Update customer_equipment RLS policies to use the efficient function
DROP POLICY IF EXISTS "Users can delete their customer equipment" ON public.customer_equipment;
DROP POLICY IF EXISTS "Users can insert their customer equipment" ON public.customer_equipment;
DROP POLICY IF EXISTS "Users can update their customer equipment" ON public.customer_equipment;
DROP POLICY IF EXISTS "Users can view their customer equipment" ON public.customer_equipment;

CREATE POLICY "Users can delete their customer equipment" 
ON public.customer_equipment 
FOR DELETE 
USING (user_id = current_user_id());

CREATE POLICY "Users can insert their customer equipment" 
ON public.customer_equipment 
FOR INSERT 
WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can update their customer equipment" 
ON public.customer_equipment 
FOR UPDATE 
USING (user_id = current_user_id());

CREATE POLICY "Users can view their customer equipment" 
ON public.customer_equipment 
FOR SELECT 
USING (user_id = current_user_id());

-- Update customer_templates RLS policies to use the efficient function
DROP POLICY IF EXISTS "Users can create their customer templates" ON public.customer_templates;
DROP POLICY IF EXISTS "Users can delete their customer templates" ON public.customer_templates;
DROP POLICY IF EXISTS "Users can update their customer templates" ON public.customer_templates;
DROP POLICY IF EXISTS "Users can view their customer templates" ON public.customer_templates;

CREATE POLICY "Users can create their customer templates" 
ON public.customer_templates 
FOR INSERT 
WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can delete their customer templates" 
ON public.customer_templates 
FOR DELETE 
USING (user_id = current_user_id());

CREATE POLICY "Users can update their customer templates" 
ON public.customer_templates 
FOR UPDATE 
USING (user_id = current_user_id());

CREATE POLICY "Users can view their customer templates" 
ON public.customer_templates 
FOR SELECT 
USING (user_id = current_user_id());