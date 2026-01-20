-- Drop the permissive insert policy and create proper one
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;

-- Only allow authenticated users to insert notifications for themselves
CREATE POLICY "Users can create notifications for themselves" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create a function to insert notifications (for system use via triggers)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.user_notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;