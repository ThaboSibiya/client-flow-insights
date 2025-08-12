
import { supabase } from '@/integrations/supabase/client';
import { logFileAccess } from './auditLogService';

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export const uploadAttachment = async (
  file: File,
  conversationId: string,
  userId: string
): Promise<AttachmentFile | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${conversationId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('conversation-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    await logFileAccess(userId, filePath, 'upload');

    const { data: { publicUrl } } = supabase.storage
      .from('conversation-attachments')
      .getPublicUrl(filePath);

    return {
      id: fileName,
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return null;
  }
};

export const deleteAttachment = async (filePath: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('conversation-attachments')
      .remove([filePath]);

    if (error) throw error;

    await logFileAccess(userId, filePath, 'delete');
    
    return true;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return false;
  }
};

export const getAttachmentUrl = (filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('conversation-attachments')
    .getPublicUrl(filePath);
  
  return publicUrl;
};

export const downloadAttachment = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading attachment:', error);
  }
};
