
-- agent_memory: per-user facts
CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  kind TEXT NOT NULL DEFAULT 'fact',
  content TEXT NOT NULL,
  source TEXT,
  confidence NUMERIC DEFAULT 0.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own agent memory" ON public.agent_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own agent memory" ON public.agent_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own agent memory" ON public.agent_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own agent memory" ON public.agent_memory FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_agent_memory_user ON public.agent_memory(user_id, created_at DESC);
CREATE TRIGGER trg_agent_memory_updated BEFORE UPDATE ON public.agent_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- agent_customer_memory
CREATE TABLE public.agent_customer_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  customer_id UUID NOT NULL,
  summary TEXT,
  preferred_channel TEXT,
  tone_notes TEXT,
  last_touchpoint_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_id)
);
ALTER TABLE public.agent_customer_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own customer memory" ON public.agent_customer_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own customer memory" ON public.agent_customer_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own customer memory" ON public.agent_customer_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own customer memory" ON public.agent_customer_memory FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_agent_customer_memory_cust ON public.agent_customer_memory(customer_id);
CREATE TRIGGER trg_agent_customer_memory_updated BEFORE UPDATE ON public.agent_customer_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- agent_feedback
CREATE TABLE public.agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  message_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own feedback" ON public.agent_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own feedback" ON public.agent_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own feedback" ON public.agent_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own feedback" ON public.agent_feedback FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_agent_feedback_msg ON public.agent_feedback(message_id);
