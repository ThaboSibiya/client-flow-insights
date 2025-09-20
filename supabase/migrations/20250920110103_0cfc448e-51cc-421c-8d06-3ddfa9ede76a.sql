-- Optimize real-time performance by setting REPLICA IDENTITY and managing publications

-- Set REPLICA IDENTITY FULL for frequently updated tables to capture complete row data
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.email_sync_status REPLICA IDENTITY FULL;

-- Add these tables to the supabase_realtime publication for real-time functionality
-- Only add tables that actually need real-time updates to reduce overhead
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_sync_status;

-- Create indexes on frequently filtered columns for real-time subscriptions
CREATE INDEX IF NOT EXISTS idx_conversations_company_owner_id ON public.conversations(company_owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sync_status_provider_user ON public.email_sync_status(provider_id, user_id);

-- Create partial indexes for active conversations to improve real-time query performance
CREATE INDEX IF NOT EXISTS idx_conversations_active_last_message ON public.conversations(company_owner_id, last_message_at DESC) 
WHERE status = 'active';

-- Create covering index for messages to avoid table lookups in real-time queries
CREATE INDEX IF NOT EXISTS idx_messages_realtime_covering ON public.messages(conversation_id, created_at DESC) 
INCLUDE (id, sender_type, sender_name, content);