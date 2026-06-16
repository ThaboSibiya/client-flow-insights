DROP POLICY IF EXISTS "Anyone can upload a company logo." ON storage.objects;

CREATE POLICY "Users can upload company logos to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_logos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);