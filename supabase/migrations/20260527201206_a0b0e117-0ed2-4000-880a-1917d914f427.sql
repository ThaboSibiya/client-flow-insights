
CREATE TABLE public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_id uuid,
  conversation_id uuid,
  request_type text NOT NULL,
  model text,
  provider text,
  voice boolean NOT NULL DEFAULT false,
  prompt_chars integer NOT NULL DEFAULT 0,
  completion_chars integer NOT NULL DEFAULT 0,
  prompt_tokens integer,
  completion_tokens integer,
  latency_ms integer,
  status text NOT NULL DEFAULT 'success',
  error_code text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_log_user_created ON public.ai_usage_log (user_id, created_at DESC);
CREATE INDEX idx_ai_usage_log_workspace_created ON public.ai_usage_log (workspace_id, created_at DESC);
CREATE INDEX idx_ai_usage_log_conversation ON public.ai_usage_log (conversation_id);

GRANT SELECT ON public.ai_usage_log TO authenticated;
GRANT ALL ON public.ai_usage_log TO service_role;

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ai usage"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Workspace members view workspace ai usage"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING (
    workspace_id IS NOT NULL
    AND public.is_workspace_member(auth.uid(), workspace_id)
  );
