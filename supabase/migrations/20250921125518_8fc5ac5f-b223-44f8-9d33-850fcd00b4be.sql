-- Fix RLS performance issue on email_attachments table
-- Replace direct auth.uid() calls with scalar subqueries to avoid per-row re-evaluation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own email attachments" ON public.email_attachments;
DROP POLICY IF EXISTS "Users can delete their own email attachments" ON public.email_attachments;
DROP POLICY IF EXISTS "Users can update their own email attachments" ON public.email_attachments;
DROP POLICY IF EXISTS "Users can view their own email attachments" ON public.email_attachments;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can create their own email attachments" 
ON public.email_attachments 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own email attachments" 
ON public.email_attachments 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own email attachments" 
ON public.email_attachments 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view their own email attachments" 
ON public.email_attachments 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Add index on user_id column if it doesn't exist to improve RLS performance
CREATE INDEX IF NOT EXISTS idx_email_attachments_user_id ON public.email_attachments(user_id);