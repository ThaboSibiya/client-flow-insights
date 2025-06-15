
-- Create a storage bucket for knowledge base files.
-- Files in this bucket will be private and accessible only to the user who uploaded them.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge_base', 'knowledge_base', false, 5242880, ARRAY['application/pdf', 'text/plain', 'text/markdown', 'text/csv'])
ON CONFLICT (id) DO NOTHING;

-- Create a table to store metadata for the uploaded files.
CREATE TABLE public.knowledge_base_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comments to explain the table and columns.
COMMENT ON TABLE public.knowledge_base_files IS 'Stores metadata for files uploaded to the knowledge base.';
COMMENT ON COLUMN public.knowledge_base_files.user_id IS 'The user who uploaded the file.';

-- Enable Row Level Security to ensure users can only access their own files.
ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;

-- Create policies for selecting, inserting, and deleting files.
CREATE POLICY "Users can view their own knowledge base files"
ON public.knowledge_base_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge base files"
ON public.knowledge_base_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base files"
ON public.knowledge_base_files FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for the storage bucket to control file access.
-- The file path is structured as '{user_id}/{file_name}'.
CREATE POLICY "Users can view their own files in knowledge base storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge_base' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can upload to their own folder in the knowledge base"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'knowledge_base' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can delete their own files from the knowledge base"
ON storage.objects FOR DELETE
USING (bucket_id = 'knowledge_base' AND auth.uid() = (storage.foldername(name))[1]::uuid);
