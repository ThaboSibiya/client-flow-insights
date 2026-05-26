
CREATE TABLE public.agent_scheduled_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekdays','weekly','monthly')),
  time_of_day TIME NOT NULL DEFAULT '08:00',
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month SMALLINT CHECK (day_of_month BETWEEN 1 AND 28),
  timezone TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_result_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_scheduled_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scheduled prompts"
  ON public.agent_scheduled_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own scheduled prompts"
  ON public.agent_scheduled_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own scheduled prompts"
  ON public.agent_scheduled_prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own scheduled prompts"
  ON public.agent_scheduled_prompts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_agent_scheduled_prompts_due
  ON public.agent_scheduled_prompts (next_run_at)
  WHERE is_active = true;

CREATE INDEX idx_agent_scheduled_prompts_user
  ON public.agent_scheduled_prompts (user_id, created_at DESC);

CREATE TRIGGER trg_agent_scheduled_prompts_updated_at
  BEFORE UPDATE ON public.agent_scheduled_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
