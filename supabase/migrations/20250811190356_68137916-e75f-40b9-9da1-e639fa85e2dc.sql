
-- Phase 1: Secure Business Template Tables
-- Add user_id column to industry_customer_templates for ownership tracking
ALTER TABLE public.industry_customer_templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to industry_templates for ownership tracking  
ALTER TABLE public.industry_templates
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive RLS policies for templates
DROP POLICY IF EXISTS "Templates are viewable by authenticated users" ON public.industry_customer_templates;
DROP POLICY IF EXISTS "Industry templates are viewable by authenticated users" ON public.industry_templates;

-- Create secure RLS policies for industry_customer_templates
CREATE POLICY "Users can view their own customer templates" 
ON public.industry_customer_templates 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own customer templates" 
ON public.industry_customer_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer templates" 
ON public.industry_customer_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer templates" 
ON public.industry_customer_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for industry_templates
CREATE POLICY "Users can view their own industry templates" 
ON public.industry_templates 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own industry templates" 
ON public.industry_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own industry templates" 
ON public.industry_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own industry templates" 
ON public.industry_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Phase 2: Secure Email History Table
-- Add user_id column to email_history for ownership tracking
ALTER TABLE public.email_history 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive RLS policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.email_history;

-- Create secure RLS policies for email_history
CREATE POLICY "Users can view their own email history" 
ON public.email_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email history" 
ON public.email_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email history" 
ON public.email_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email history" 
ON public.email_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance on the new user_id columns
CREATE INDEX idx_industry_customer_templates_user_id ON public.industry_customer_templates(user_id);
CREATE INDEX idx_industry_templates_user_id ON public.industry_templates(user_id);
CREATE INDEX idx_email_history_user_id ON public.email_history(user_id);

-- Update template_fields to have proper ownership through template relationship
-- Drop existing policy that allows all authenticated users
DROP POLICY IF EXISTS "Template fields are viewable by authenticated users" ON public.template_fields;

-- Create secure RLS policies for template_fields based on template ownership
CREATE POLICY "Users can view template fields for their own templates" 
ON public.template_fields 
FOR SELECT 
USING (
  template_id IN (
    SELECT id FROM public.industry_templates 
    WHERE user_id = auth.uid() OR user_id IS NULL
  )
);

CREATE POLICY "Users can create template fields for their own templates" 
ON public.template_fields 
FOR INSERT 
WITH CHECK (
  template_id IN (
    SELECT id FROM public.industry_templates 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update template fields for their own templates" 
ON public.template_fields 
FOR UPDATE 
USING (
  template_id IN (
    SELECT id FROM public.industry_templates 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete template fields for their own templates" 
ON public.template_fields 
FOR DELETE 
USING (
  template_id IN (
    SELECT id FROM public.industry_templates 
    WHERE user_id = auth.uid()
  )
);
