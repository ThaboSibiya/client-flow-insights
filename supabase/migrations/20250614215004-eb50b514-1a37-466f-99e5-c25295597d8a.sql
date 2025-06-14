
-- Create conversations table for organizing all communications
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_owner_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  employee_id UUID REFERENCES public.employees(id),
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'internal_chat', 'form_submission')),
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for all communication messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'employee', 'system')),
  sender_id UUID, -- Can reference customers.id or employees.id
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'email', 'whatsapp', 'form_data', 'internal_note')),
  metadata JSONB, -- For storing additional data like form fields, email headers, etc.
  attachments JSONB, -- For storing file attachments
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table for website form notifications
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_owner_id UUID REFERENCES auth.users NOT NULL,
  form_name TEXT NOT NULL,
  form_data JSONB NOT NULL,
  source_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Company owners can manage their conversations"
  ON public.conversations
  FOR ALL
  USING (company_owner_id = auth.uid());

-- RLS policies for messages
CREATE POLICY "Company owners can manage messages in their conversations"
  ON public.messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.company_owner_id = auth.uid()
    )
  );

-- RLS policies for form_submissions
CREATE POLICY "Company owners can manage their form submissions"
  ON public.form_submissions
  FOR ALL
  USING (company_owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_conversations_company_owner ON public.conversations(company_owner_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_form_submissions_company_owner ON public.form_submissions(company_owner_id);

-- Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_message_at
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
