
CREATE TABLE public.agent_action_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID,
  conversation_id UUID,
  plan_id UUID NOT NULL,
  plan_title TEXT,
  step_index INT NOT NULL,
  tool_name TEXT NOT NULL,
  args JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed','skipped','undone')),
  inverse_op JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own action log" ON public.agent_action_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own action log" ON public.agent_action_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own action log" ON public.agent_action_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own action log" ON public.agent_action_log
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_agent_action_log_plan ON public.agent_action_log (plan_id, step_index);
CREATE INDEX idx_agent_action_log_user ON public.agent_action_log (user_id, created_at DESC);
