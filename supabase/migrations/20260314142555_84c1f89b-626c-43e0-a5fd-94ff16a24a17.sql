ALTER POLICY "Users can view workspaces they belong to"
ON public.workspaces
USING (
  is_workspace_member(auth.uid(), id)
  OR created_by = auth.uid()
);