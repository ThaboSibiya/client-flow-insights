-- P5: Add recipient fields to conversations table
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS recipient_email text,
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_name text;

COMMENT ON COLUMN public.conversations.recipient_email IS 'Recipient email for email-type conversations';
COMMENT ON COLUMN public.conversations.recipient_phone IS 'Recipient phone/chat ID for WhatsApp/Telegram conversations';
COMMENT ON COLUMN public.conversations.recipient_name IS 'Display name of the recipient';