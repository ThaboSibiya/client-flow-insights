-- Add ticket_id and photos columns to job_completions
ALTER TABLE public.job_completions
  ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS work_summary text;

-- Index for ticket lookups
CREATE INDEX IF NOT EXISTS idx_job_completions_ticket_id ON public.job_completions(ticket_id);