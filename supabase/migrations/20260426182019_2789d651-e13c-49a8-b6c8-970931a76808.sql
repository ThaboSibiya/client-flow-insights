-- Add appId column to profiles for CyberLSI per-user app mapping
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cyberlsi_app_id TEXT;

-- MFA challenges table: tracks browser->mobile push approval workflow state
CREATE TABLE IF NOT EXISTS public.cyberlsi_mfa_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cyberlsi_user_id TEXT NOT NULL,
  cyberlsi_app_id TEXT,
  -- Reference returned by CyberLSI when we send the push
  challenge_ref TEXT,
  -- Template + placeholders used (audit/replay)
  template_code TEXT,
  placeholders JSONB DEFAULT '[]'::jsonb,
  security_mode INTEGER DEFAULT 0, -- 0=None, 1=PIN, 2=NFC, 3=Both
  -- Workflow state
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending','approved','denied','expired','error')),
  -- Result/details
  response_payload JSONB,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cyberlsi_mfa_user ON public.cyberlsi_mfa_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_cyberlsi_mfa_status ON public.cyberlsi_mfa_challenges(status);
CREATE INDEX IF NOT EXISTS idx_cyberlsi_mfa_ref ON public.cyberlsi_mfa_challenges(challenge_ref);
CREATE INDEX IF NOT EXISTS idx_cyberlsi_mfa_expires ON public.cyberlsi_mfa_challenges(expires_at);

ALTER TABLE public.cyberlsi_mfa_challenges ENABLE ROW LEVEL SECURITY;

-- Users can view their own challenges (to poll status from the browser)
CREATE POLICY "Users view own MFA challenges"
ON public.cyberlsi_mfa_challenges
FOR SELECT
USING (auth.uid() = user_id);

-- Only the service role (edge function) can insert/update challenge state
CREATE POLICY "Service role manages MFA challenges"
ON public.cyberlsi_mfa_challenges
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE TRIGGER update_cyberlsi_mfa_challenges_updated_at
BEFORE UPDATE ON public.cyberlsi_mfa_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();