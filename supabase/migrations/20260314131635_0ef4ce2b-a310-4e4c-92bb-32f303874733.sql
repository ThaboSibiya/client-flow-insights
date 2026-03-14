
-- Create workspace_role enum
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug)
);

-- Workspace members (junction table)
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  );
$$;

-- Security definer function to check workspace role
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id UUID, _workspace_id UUID, _role workspace_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id
      AND workspace_id = _workspace_id
      AND role = _role
  );
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Workspace owners/admins can update"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (
    public.has_workspace_role(auth.uid(), id, 'owner')
    OR public.has_workspace_role(auth.uid(), id, 'admin')
  );

CREATE POLICY "Workspace owners can delete"
  ON public.workspaces FOR DELETE TO authenticated
  USING (public.has_workspace_role(auth.uid(), id, 'owner'));

-- RLS Policies for workspace_members
CREATE POLICY "Members can view fellow members"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Owners/admins can add members"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
    -- Allow self-insert when creating a workspace (first member)
    OR (user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners/admins can update members"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner')
    OR public.has_workspace_role(auth.uid(), workspace_id, 'admin')
  );

CREATE POLICY "Owners can remove members"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (
    public.has_workspace_role(auth.uid(), workspace_id, 'owner')
    OR user_id = auth.uid()
  );

-- Updated_at trigger
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspaces_created_by ON public.workspaces(created_by);
