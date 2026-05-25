
CREATE TABLE public.agent_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggested_action JSONB,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMP WITH TIME ZONE,
  dedupe_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX agent_alerts_user_dedupe_open_idx
  ON public.agent_alerts (user_id, dedupe_key)
  WHERE status = 'open' AND dedupe_key IS NOT NULL;

CREATE INDEX agent_alerts_user_status_created_idx
  ON public.agent_alerts (user_id, status, created_at DESC);

ALTER TABLE public.agent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own alerts"
  ON public.agent_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update their own alerts"
  ON public.agent_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own alerts"
  ON public.agent_alerts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own alerts"
  ON public.agent_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER agent_alerts_updated_at
  BEFORE UPDATE ON public.agent_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_alerts;
ALTER TABLE public.agent_alerts REPLICA IDENTITY FULL;
