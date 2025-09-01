
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logSecureSecurityEvent } from './secureSecurityService';

export interface SecureAttachmentFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  url?: string;  // Will be signed URL
  conversation_id?: string;
  uploaded_by?: string;
  created_at?: string;
}

export const uploadSecureAttachment = async (
  file: File, 
  conversationId: string, 
  userId: string,
  bucketName: 'ticket-attachments' | 'conversation-attachments' = 'conversation-attachments'
): Promise<SecureAttachmentFile | null> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${userId}/${conversationId}/${fileName}`;
    
    // Upload to private Supabase storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Log secure file access
    await logSecureSecurityEvent({
      action: 'file_upload',
      resource_type: 'attachment',
      resource_id: filePath,
      success: true,
      metadata: {
        file_name: fileName,
        file_size: file.size,
        bucket: bucketName,
        conversation_id: conversationId
      }
    });

    const attachmentFile: SecureAttachmentFile = {
      id: crypto.randomUUID(),
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      conversation_id: conversationId,
      uploaded_by: userId,
      created_at: new Date().toISOString()
    };

    return attachmentFile;
  } catch (error) {
    console.error('Error uploading secure attachment:', error);
    
    await logSecureSecurityEvent({
      action: 'file_upload_failed',
      resource_type: 'attachment',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    toast({
      title: "Upload Error",
      description: "Failed to upload attachment securely",
      variant: "destructive",
    });
    return null;
  }
};

export const getSecureAttachmentUrl = async (
  filePath: string, 
  bucketName: 'ticket-attachments' | 'conversation-attachments' = 'conversation-attachments',
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    await logSecureSecurityEvent({
      action: 'file_access',
      resource_type: 'attachment',
      resource_id: filePath,
      success: true,
      metadata: { bucket: bucketName, expires_in: expiresIn }
    });

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    
    await logSecureSecurityEvent({
      action: 'file_access_failed',
      resource_type: 'attachment',
      resource_id: filePath,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return null;
  }
};

export const downloadSecureAttachment = async (
  filePath: string, 
  fileName: string,
  bucketName: 'ticket-attachments' | 'conversation-attachments' = 'conversation-attachments'
) => {
  try {
    const signedUrl = await getSecureAttachmentUrl(filePath, bucketName, 300); // 5 minutes
    
    if (!signedUrl) {
      throw new Error('Failed to get secure download URL');
    }

    const response = await fetch(signedUrl);
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

    await logSecureSecurityEvent({
      action: 'file_download',
      resource_type: 'attachment',
      resource_id: filePath,
      success: true,
      metadata: { file_name: fileName, bucket: bucketName }
    });

    return true;
  } catch (error) {
    console.error('Error downloading secure attachment:', error);
    
    await logSecureSecurityEvent({
      action: 'file_download_failed',
      resource_type: 'attachment',
      resource_id: filePath,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    toast({
      title: "Download Error", 
      description: "Failed to download attachment securely",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteSecureAttachment = async (
  filePath: string,
  bucketName: 'ticket-attachments' | 'conversation-attachments' = 'conversation-attachments'
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;

    await logSecureSecurityEvent({
      action: 'file_delete',
      resource_type: 'attachment',
      resource_id: filePath,
      success: true,
      metadata: { bucket: bucketName }
    });

    return true;
  } catch (error) {
    console.error('Error deleting secure attachment:', error);
    
    await logSecureSecurityEvent({
      action: 'file_delete_failed',
      resource_type: 'attachment',
      resource_id: filePath,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return false;
  }
};
