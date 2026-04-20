ALTER TABLE public.employee_privileges
  ADD COLUMN IF NOT EXISTS can_use_ai_agent boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_create_ai_workflows boolean DEFAULT true;

-- Backfill existing rows to grant access by default (employees can chat + create)
UPDATE public.employee_privileges
SET can_use_ai_agent = COALESCE(can_use_ai_agent, true),
    can_create_ai_workflows = COALESCE(can_create_ai_workflows, true)
WHERE can_use_ai_agent IS NULL OR can_create_ai_workflows IS NULL;