-- Add user_id column to company_settings table for proper ownership
ALTER TABLE public.company_settings 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing settings to associate them with users (this will need manual intervention for existing data)
-- For now, we'll leave existing records with NULL user_id

-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Allow authenticated read access to settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow authenticated insert access to settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow authenticated update access to settings" ON public.company_settings;

-- Create secure RLS policies that enforce user ownership
CREATE POLICY "Users can view their own company settings" 
ON public.company_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings" 
ON public.company_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" 
ON public.company_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company settings" 
ON public.company_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for performance on the new user_id column
CREATE INDEX idx_company_settings_user_id ON public.company_settings(user_id);