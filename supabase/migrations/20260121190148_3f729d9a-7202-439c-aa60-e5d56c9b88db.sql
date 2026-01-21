-- Create avatars storage bucket for user profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add policies for company_logos bucket if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Company logos are publicly accessible'
  ) THEN
    CREATE POLICY "Company logos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'company_logos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload their own company logo'
  ) THEN
    CREATE POLICY "Users can upload their own company logo"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'company_logos' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own company logo'
  ) THEN
    CREATE POLICY "Users can update their own company logo"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'company_logos' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own company logo'
  ) THEN
    CREATE POLICY "Users can delete their own company logo"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'company_logos' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;