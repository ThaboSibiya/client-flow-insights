
-- Add workspace_id to quotes_invoices and projects
ALTER TABLE public.quotes_invoices
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_quotes_invoices_workspace ON public.quotes_invoices(workspace_id);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
