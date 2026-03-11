
-- Add reason and source columns to customers table for Voice AI agent data
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS source text;

COMMENT ON COLUMN public.customers.reason IS 'AI-generated summary of caller pain points or inquiry reason';
COMMENT ON COLUMN public.customers.source IS 'Lead source channel (e.g. Voice AI Agent, Website, Referral)';
