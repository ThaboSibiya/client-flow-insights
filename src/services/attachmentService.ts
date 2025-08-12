import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logFileAccess } from './auditLogService';

export const uploadAttachment = async (file: File, conversationId: string, userId: string) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `conversations/${conversationId}/${fileName}`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save attachment record
    const { data, error } = await supabase
      .from('message_attachments')
      .insert({
        conversation_id: conversationId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Log file access
    await logFileAccess(userId, filePath, 'upload');

    return data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    toast({
      title: "Upload Error",
      description: "Failed to upload attachment",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadAttachment = async (attachmentId: string, userId: string) => {
  try {
    // Get attachment info
    const { data: attachment, error } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (error) throw error;

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('attachments')
      .download(attachment.file_path);

    if (downloadError) throw downloadError;

    // Log file access
    await logFileAccess(userId, attachment.file_path, 'download');

    // Create download link
    const url = URL.createObjectURL(fileData);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return attachment;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    toast({
      title: "Download Error", 
      description: "Failed to download attachment",
      variant: "destructive",
    });
    throw error;
  }
};
