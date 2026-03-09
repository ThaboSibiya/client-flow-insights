
CREATE TABLE public.workflow_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Workflow',
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  trigger_type TEXT DEFAULT 'simple',
  trigger_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations"
  ON public.workflow_automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automations"
  ON public.workflow_automations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations"
  ON public.workflow_automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations"
  ON public.workflow_automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_workflow_automations_updated_at
  BEFORE UPDATE ON public.workflow_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
