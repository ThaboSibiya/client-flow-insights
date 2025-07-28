
-- Create email_threads table to group related emails
CREATE TABLE public.email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL, -- External thread ID from email provider
  subject TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of email addresses
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  unread_count INTEGER NOT NULL DEFAULT 0,
  labels JSONB DEFAULT '[]'::jsonb, -- Gmail labels, Outlook categories, etc.
  provider_id TEXT NOT NULL, -- Reference to email integration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emails table to store individual email messages
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL, -- Unique ID from email provider
  provider_id TEXT NOT NULL, -- Reference to email integration
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB NOT NULL, -- Array of recipient email addresses
  cc_emails JSONB DEFAULT '[]'::jsonb,
  bcc_emails JSONB DEFAULT '[]'::jsonb,
  reply_to TEXT,
  body_text TEXT,
  body_html TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_sent BOOLEAN NOT NULL DEFAULT false, -- true if sent by user, false if received
  is_draft BOOLEAN NOT NULL DEFAULT false,
  importance TEXT DEFAULT 'normal', -- low, normal, high
  labels JSONB DEFAULT '[]'::jsonb,
  message_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_attachments table
CREATE TABLE public.email_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  attachment_id TEXT, -- Provider-specific attachment ID
  file_path TEXT, -- Path in Supabase storage if downloaded
  is_downloaded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_sync_status table to track sync progress
CREATE TABLE public.email_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL, -- Reference to email integration
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_token TEXT, -- For incremental sync (Gmail historyId, Outlook deltaToken)
  sync_status TEXT NOT NULL DEFAULT 'idle', -- idle, syncing, error
  error_message TEXT,
  total_emails_synced INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Add indexes for performance
CREATE INDEX idx_email_threads_user_id ON public.email_threads(user_id);
CREATE INDEX idx_email_threads_last_message_at ON public.email_threads(last_message_at DESC);
CREATE INDEX idx_email_threads_provider_thread_id ON public.email_threads(provider_id, thread_id);

CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_thread_id ON public.emails(thread_id);
CREATE INDEX idx_emails_message_date ON public.emails(message_date DESC);
CREATE INDEX idx_emails_provider_message_id ON public.emails(provider_id, provider_message_id);
CREATE INDEX idx_emails_is_read ON public.emails(is_read);

CREATE INDEX idx_email_attachments_email_id ON public.email_attachments(email_id);
CREATE INDEX idx_email_sync_status_user_provider ON public.email_sync_status(user_id, provider_id);

-- Enable Row Level Security
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_threads
CREATE POLICY "Users can view their own email threads" 
  ON public.email_threads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email threads" 
  ON public.email_threads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email threads" 
  ON public.email_threads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email threads" 
  ON public.email_threads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for emails
CREATE POLICY "Users can view their own emails" 
  ON public.emails 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emails" 
  ON public.emails 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails" 
  ON public.emails 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails" 
  ON public.emails 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for email_attachments
CREATE POLICY "Users can view their own email attachments" 
  ON public.email_attachments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email attachments" 
  ON public.email_attachments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email attachments" 
  ON public.email_attachments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email attachments" 
  ON public.email_attachments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for email_sync_status
CREATE POLICY "Users can view their own sync status" 
  ON public.email_sync_status 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sync status" 
  ON public.email_sync_status 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync status" 
  ON public.email_sync_status 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync status" 
  ON public.email_sync_status 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update thread stats when emails are added/updated
CREATE OR REPLACE FUNCTION update_email_thread_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update thread stats when email is inserted or updated
  UPDATE public.email_threads 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
    ),
    unread_count = (
      SELECT COUNT(*) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id) 
      AND is_read = false
    ),
    last_message_at = (
      SELECT MAX(message_date) 
      FROM public.emails 
      WHERE thread_id = COALESCE(NEW.thread_id, OLD.thread_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to maintain thread statistics
CREATE TRIGGER update_thread_stats_on_email_insert
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION update_email_thread_stats();

CREATE TRIGGER update_thread_stats_on_email_update
  AFTER UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION update_email_thread_stats();

CREATE TRIGGER update_thread_stats_on_email_delete
  AFTER DELETE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION update_email_thread_stats();
