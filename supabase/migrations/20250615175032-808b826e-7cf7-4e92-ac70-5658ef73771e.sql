
-- Create a table to store automation settings for each user
CREATE TABLE public.automation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Email Automation
    email_auto_send BOOLEAN NOT NULL DEFAULT false,
    email_template TEXT NOT NULL DEFAULT 'default',
    email_subject TEXT,
    email_message TEXT,

    -- WhatsApp Automation
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
    whatsapp_template TEXT,

    -- Follow-up Automation
    follow_up_enabled BOOLEAN NOT NULL DEFAULT false,
    first_follow_up_days INT NOT NULL DEFAULT 3,
    second_follow_up_days INT NOT NULL DEFAULT 7,
    final_follow_up_days INT NOT NULL DEFAULT 14,
    reminder_template TEXT,

    -- General Rules
    auto_create_invoice_from_quote BOOLEAN NOT NULL DEFAULT false,
    send_on_create BOOLEAN NOT NULL DEFAULT false,
    mark_overdue_after_days INT NOT NULL DEFAULT 30,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for automation_settings
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation settings"
ON public.automation_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation settings"
ON public.automation_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation settings"
ON public.automation_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation settings"
ON public.automation_settings FOR DELETE
USING (auth.uid() = user_id);
