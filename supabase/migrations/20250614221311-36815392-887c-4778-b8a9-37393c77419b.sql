
-- Create storage bucket for conversation attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('conversation-attachments', 'conversation-attachments', true);

-- Create RLS policies for the conversation-attachments bucket
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'conversation-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'conversation-attachments'
);

CREATE POLICY "Users can delete their attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'conversation-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update messages table to include attachment metadata if not already present
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages USING GIN (attachments);
