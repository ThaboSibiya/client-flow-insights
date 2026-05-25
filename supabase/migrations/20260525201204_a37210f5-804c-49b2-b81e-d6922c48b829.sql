CREATE TABLE public.agent_daily_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  briefing_date DATE NOT NULL DEFAULT (now()::date),
  summary TEXT NOT NULL,
  priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  posted_to_chat BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, briefing_date)
);

ALTER TABLE public.agent_daily_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own briefings"
  ON public.agent_daily_briefings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own briefings"
  ON public.agent_daily_briefings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own briefings"
  ON public.agent_daily_briefings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_agent_daily_briefings_user_date
  ON public.agent_daily_briefings(user_id, briefing_date DESC);