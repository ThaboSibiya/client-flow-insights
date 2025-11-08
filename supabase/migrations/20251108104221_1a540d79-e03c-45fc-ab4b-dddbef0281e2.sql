-- Create reminder history table
CREATE TABLE public.reminder_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminder_history ENABLE ROW LEVEL SECURITY;

-- Create policies for reminder history
CREATE POLICY "Users can view their reminder history"
ON public.reminder_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their reminder history"
ON public.reminder_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_reminder_history_customer ON public.reminder_history(customer_id);
CREATE INDEX idx_reminder_history_user ON public.reminder_history(user_id);
CREATE INDEX idx_reminder_history_sent_at ON public.reminder_history(sent_at DESC);