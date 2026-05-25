-- Conversations
CREATE TABLE public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID,
  title TEXT NOT NULL DEFAULT 'New conversation',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_conversations_user ON public.agent_conversations(user_id, last_message_at DESC);
CREATE INDEX idx_agent_conversations_workspace ON public.agent_conversations(workspace_id) WHERE workspace_id IS NOT NULL;

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own agent conversations"
  ON public.agent_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users create own agent conversations"
  ON public.agent_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own agent conversations"
  ON public.agent_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own agent conversations"
  ON public.agent_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER agent_conversations_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages
CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL DEFAULT '',
  action_taken TEXT,
  action_result JSONB,
  meeting_notes JSONB,
  update_report JSONB,
  pending_action JSONB,
  pending_resolved TEXT CHECK (pending_resolved IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_messages_conversation ON public.agent_messages(conversation_id, created_at);
CREATE INDEX idx_agent_messages_user ON public.agent_messages(user_id);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own agent messages"
  ON public.agent_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users create own agent messages"
  ON public.agent_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own agent messages"
  ON public.agent_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own agent messages"
  ON public.agent_messages FOR DELETE USING (auth.uid() = user_id);

-- Keep conversation last_message_at fresh
CREATE OR REPLACE FUNCTION public.touch_agent_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.agent_conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER agent_messages_touch_conversation
  AFTER INSERT ON public.agent_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_agent_conversation();