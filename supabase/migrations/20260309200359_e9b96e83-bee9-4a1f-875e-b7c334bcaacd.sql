
-- P2: Add last_message_preview column to conversations and create trigger
-- to auto-update last_message_at, last_message_preview on new message insert

-- Add last_message_preview column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'conversations' 
    AND column_name = 'last_message_preview'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_preview text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'conversations' 
    AND column_name = 'unread_count'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN unread_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Replace the existing trigger function with an enhanced version
CREATE OR REPLACE FUNCTION public.update_conversation_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 150),
    unread_count = CASE 
      WHEN NEW.sender_type = 'customer' THEN COALESCE(unread_count, 0) + 1
      ELSE unread_count
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS on_message_insert_update_conversation ON public.messages;
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.messages;

CREATE TRIGGER on_message_insert_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_new_message();

-- Create function to reset unread count when employee reads
CREATE OR REPLACE FUNCTION public.reset_conversation_unread(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations
  SET unread_count = 0, updated_at = now()
  WHERE id = p_conversation_id;
  
  UPDATE public.messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id AND is_read = false;
END;
$function$;
