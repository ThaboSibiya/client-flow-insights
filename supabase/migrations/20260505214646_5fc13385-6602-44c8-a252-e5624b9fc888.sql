
-- New service-role-only table for invitation tokens
CREATE TABLE IF NOT EXISTS public.workspace_invitation_tokens (
  invitation_id UUID PRIMARY KEY REFERENCES public.workspace_invitations(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_invitation_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to workspace invitation tokens"
ON public.workspace_invitation_tokens
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Migrate any existing tokens
INSERT INTO public.workspace_invitation_tokens (invitation_id, token)
SELECT id, token
FROM public.workspace_invitations
WHERE token IS NOT NULL
ON CONFLICT (invitation_id) DO NOTHING;

-- Drop the now-redundant token column from the readable table
ALTER TABLE public.workspace_invitations
  DROP COLUMN IF EXISTS token;
