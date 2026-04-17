-- Meeting notes table
CREATE TABLE public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  summary TEXT,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  raw_transcript TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own meeting notes"
  ON public.meeting_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own meeting notes"
  ON public.meeting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own meeting notes"
  ON public.meeting_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own meeting notes"
  ON public.meeting_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meeting_notes_user_created ON public.meeting_notes(user_id, created_at DESC);

-- Follow-ups table
CREATE TABLE public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  date DATE,
  method TEXT NOT NULL DEFAULT 'call',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own followups"
  ON public.followups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own followups"
  ON public.followups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own followups"
  ON public.followups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own followups"
  ON public.followups FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_followups_user_date ON public.followups(user_id, date);
CREATE INDEX idx_followups_user_status ON public.followups(user_id, status);