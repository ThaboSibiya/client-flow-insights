-- Helper: confirm the storage object belongs to a ticket the caller can access
CREATE OR REPLACE FUNCTION public.can_access_ticket_attachment(_object_name text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ticket_attachments ta
    JOIN public.tickets t ON t.id::text = ta.ticket_id
    WHERE ta.file_path = _object_name
      AND (
        t.user_id = _user_id
        OR t.assigned_to_id = _user_id
        OR (t.workspace_id IS NOT NULL AND public.is_workspace_member(_user_id, t.workspace_id))
      )
  );
$$;

-- Drop old over-permissive SELECT/DELETE policies that only checked folder prefix
DROP POLICY IF EXISTS "Users can view their own ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their ticket attachments" ON storage.objects;

-- New SELECT: must own the folder AND the file must belong to a ticket they can access
CREATE POLICY "Users can view ticket attachments they own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-attachments'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.can_access_ticket_attachment(name, auth.uid())
);

-- New DELETE: same ownership join
CREATE POLICY "Users can delete ticket attachments they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-attachments'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.can_access_ticket_attachment(name, auth.uid())
);