-- Add CyberLSI integration columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cyberlsi_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cyberlsi_user_id TEXT,
  ADD COLUMN IF NOT EXISTS cyberlsi_linked_at TIMESTAMPTZ;

-- Index for fast lookup by CyberLSI user id during validation callback
CREATE INDEX IF NOT EXISTS idx_profiles_cyberlsi_user_id
  ON public.profiles(cyberlsi_user_id)
  WHERE cyberlsi_user_id IS NOT NULL;

-- Audit log table for CyberLSI authentication events
CREATE TABLE IF NOT EXISTS public.cyberlsi_auth_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cyberlsi_user_id TEXT,
  auth_param_hash TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  duplicate_attempt BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cyberlsi_auth_log ENABLE ROW LEVEL SECURITY;

-- Only the user themselves can view their own CyberLSI auth log
CREATE POLICY "Users can view their own CyberLSI auth log"
  ON public.cyberlsi_auth_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- No client-side inserts; only the edge function (service role) writes here
CREATE INDEX IF NOT EXISTS idx_cyberlsi_auth_log_user_id ON public.cyberlsi_auth_log(user_id);
CREATE INDEX IF NOT EXISTS idx_cyberlsi_auth_log_created_at ON public.cyberlsi_auth_log(created_at DESC);