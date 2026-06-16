-- 1. Trigger to auto-add workspace creator as owner (bootstrap path, runs with definer rights)
CREATE OR REPLACE FUNCTION public.add_workspace_creator_as_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspaces_add_creator_as_owner ON public.workspaces;
CREATE TRIGGER workspaces_add_creator_as_owner
AFTER INSERT ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.add_workspace_creator_as_owner();

-- 2. Replace insert policy to remove the self-owner escalation branch
DROP POLICY IF EXISTS "Owners/admins can add members" ON public.workspace_members;

CREATE POLICY "Owners/admins can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  has_workspace_role((SELECT auth.uid()), workspace_id, 'owner'::workspace_role)
  OR has_workspace_role((SELECT auth.uid()), workspace_id, 'admin'::workspace_role)
);