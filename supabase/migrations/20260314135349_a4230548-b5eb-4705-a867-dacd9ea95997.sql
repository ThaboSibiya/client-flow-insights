
-- Workspace invitations table for pending invites
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE(workspace_id, email)
);

-- Enable RLS
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Policies: workspace members can view invitations for their workspace
CREATE POLICY "Workspace members can view invitations"
  ON public.workspace_invitations FOR SELECT TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

-- Owners and admins can create invitations
CREATE POLICY "Workspace admins can create invitations"
  ON public.workspace_invitations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update/delete invitations
CREATE POLICY "Workspace admins can manage invitations"
  ON public.workspace_invitations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can delete invitations"
  ON public.workspace_invitations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_invitations.workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Also allow the invited user to accept (update status)
CREATE POLICY "Invited users can accept invitations"
  ON public.workspace_invitations FOR UPDATE TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );

-- Function to accept a workspace invitation
CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(p_invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT * INTO v_invitation
  FROM public.workspace_invitations
  WHERE id = p_invitation_id
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Verify the caller's email matches
  IF v_invitation.email != (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RETURN false;
  END IF;

  -- Add as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_invitation.workspace_id, auth.uid(), v_invitation.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Mark invitation as accepted
  UPDATE public.workspace_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = p_invitation_id;

  RETURN true;
END;
$$;

-- Add workspace_id to user_notifications for scoping
ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_notifications_workspace ON public.user_notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON public.workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace ON public.workspace_invitations(workspace_id);
