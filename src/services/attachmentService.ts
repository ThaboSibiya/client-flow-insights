
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logFileAccess } from './auditLogService';

export interface AttachmentFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  conversation_id?: string;
  uploaded_by?: string;
  created_at?: string;
}

export const uploadAttachment = async (file: File, conversationId: string, userId: string): Promise<AttachmentFile | null> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `conversations/${conversationId}/${fileName}`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get signed URL (private bucket)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError) throw signedUrlError;
    const fileUrl = signedUrlData.signedUrl;

    // Log file access
    await logFileAccess(userId, filePath, 'upload');

    // Return attachment file object
    const attachmentFile: AttachmentFile = {
      id: crypto.randomUUID(),
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      url: fileUrl,
      conversation_id: conversationId,
      uploaded_by: userId,
      created_at: new Date().toISOString()
    };

    return attachmentFile;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    toast({
      title: "Upload Error",
      description: "Failed to upload attachment",
      variant: "destructive",
    });
    return null;
  }
};

export const downloadAttachment = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    
    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    toast({
      title: "Download Error", 
      description: "Failed to download attachment",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteAttachment = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('attachments')
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return false;
  }
};
