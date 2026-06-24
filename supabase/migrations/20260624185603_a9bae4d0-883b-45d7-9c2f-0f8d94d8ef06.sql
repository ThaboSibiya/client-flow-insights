
-- 1. Add UPDATE policy for conversation-attachments bucket (owner-scoped folder)
CREATE POLICY "Users can update their own conversation attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Add UPDATE policy for ticket-attachments bucket (mirrors SELECT/DELETE)
CREATE POLICY "Users can update ticket attachments they own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_access_ticket_attachment(name, auth.uid())
)
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_access_ticket_attachment(name, auth.uid())
);

-- 3. Harden Realtime broadcasts for customers:
--    Ensure REPLICA IDENTITY FULL so Supabase Realtime can evaluate RLS on every row
--    change against the subscriber's JWT. With RLS enforced per-subscriber, only
--    workspace members (the intended tenant boundary) receive change events for a
--    given customer row. This closes the gap of unfiltered subscribers receiving
--    rows they cannot read via REST.
ALTER TABLE public.customers REPLICA IDENTITY FULL;

-- Make sure RLS is enforced for the table owner too, so Realtime cannot bypass it.
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
