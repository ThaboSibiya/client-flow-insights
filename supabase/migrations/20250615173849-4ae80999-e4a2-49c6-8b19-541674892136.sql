
-- Add company_logo_url to profiles table to store the URL of the company's logo
ALTER TABLE public.profiles
ADD COLUMN company_logo_url TEXT;

-- Create a public bucket for company logos for easy access
INSERT INTO storage.buckets (id, name, public)
VALUES ('company_logos', 'company_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Add Row-Level Security policies for the new bucket to control access.
-- This policy allows public read access to logos.
CREATE POLICY "Company logos are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'company_logos' );

-- This policy allows any authenticated user to upload a logo.
CREATE POLICY "Anyone can upload a company logo."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'company_logos' );

-- This policy allows users to update their own logo.
CREATE POLICY "Users can update their own company logo."
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'company_logos' );

-- This policy allows users to delete their own logo.
CREATE POLICY "Users can delete their own company logo."
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
