
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS location text;

ALTER TABLE public.scheduled_calls
  ADD COLUMN IF NOT EXISTS assigned_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_employee_name text,
  ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_scheduled_calls_assigned_employee ON public.scheduled_calls(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_ticket ON public.scheduled_calls(ticket_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_workspace ON public.scheduled_calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON public.tickets(category);
