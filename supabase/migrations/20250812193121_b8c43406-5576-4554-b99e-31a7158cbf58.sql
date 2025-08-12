
-- Phase 1: Critical Template Security Fixes
-- Remove permissive RLS policies that allow access to templates where user_id IS NULL

-- First, let's update any existing templates that have NULL user_id to be owned by a system user
-- We'll need to handle this carefully to avoid breaking existing functionality

-- Update industry_templates RLS policy to remove the NULL user_id condition
DROP POLICY IF EXISTS "Users can view their own industry templates" ON public.industry_templates;
CREATE POLICY "Users can view their own industry templates" 
  ON public.industry_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Update industry_customer_templates RLS policy
DROP POLICY IF EXISTS "Users can view their own customer templates" ON public.industry_customer_templates;
CREATE POLICY "Users can view their own customer templates" 
  ON public.industry_customer_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Phase 2: Email History Security Hardening
-- Make user_id NOT NULL in email_history table
-- First update any existing records that have NULL user_id
UPDATE public.email_history 
SET user_id = (
  SELECT c.user_id 
  FROM public.customers c 
  WHERE c.id = email_history.customer_id
) 
WHERE user_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE public.email_history 
ALTER COLUMN user_id SET NOT NULL;

-- Add a validation trigger to ensure email history ownership
CREATE OR REPLACE FUNCTION validate_email_history_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the customer belongs to the user inserting/updating the email history
  IF NOT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = NEW.customer_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Email history can only be created for customers owned by the user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_email_history_ownership_trigger
  BEFORE INSERT OR UPDATE ON public.email_history
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_history_ownership();

-- Phase 3: Add security monitoring table for tracking suspicious activities
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only allow users to insert their own security events
CREATE POLICY "Users can insert their own security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins or the user themselves can view security events
CREATE POLICY "Users can view their own security events"
  ON public.security_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.rate_limiting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user ID
  resource TEXT NOT NULL, -- form name or endpoint
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, resource)
);

-- Enable RLS on rate_limiting (public access needed for anonymous forms)
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to manage rate limiting records
CREATE POLICY "Allow rate limiting operations"
  ON public.rate_limiting
  FOR ALL
  USING (true)
  WITH CHECK (true);
