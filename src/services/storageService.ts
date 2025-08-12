
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logFileAccess } from './auditLogService';

export const uploadFile = async (file: File, path: string, userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(path, file);

    if (error) throw error;

    // Log file upload
    await logFileAccess(userId, path, 'upload');

    return data;
  } catch (error) {
    console.error('File upload error:', error);
    toast({
      title: "Upload Failed",
      description: "Failed to upload file. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const downloadFile = async (path: string, userId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(path);

    if (error) throw error;

    // Log file download
    await logFileAccess(userId, path, 'download');

    return data;
  } catch (error) {
    console.error('File download error:', error);
    toast({
      title: "Download Failed", 
      description: "Failed to download file. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const deleteFile = async (path: string, userId: string) => {
  try {
    const { error } = await supabase.storage
      .from('attachments')
      .remove([path]);

    if (error) throw error;

    // Log file deletion
    await logFileAccess(userId, path, 'delete');

    return { success: true };
  } catch (error) {
    console.error('File delete error:', error);
    toast({
      title: "Delete Failed",
      description: "Failed to delete file. Please try again.",
      variant: "destructive",
    });
    return { success: false, error };
  }
};

export const getFileUrl = async (path: string) => {
  try {
    const { data } = supabase.storage
      .from('attachments')
      .getPublicUrl(path)

    return data.publicUrl;
  } catch (error) {
    console.error('Get file URL error:', error);
    return null;
  }
};

export const listFiles = async (directory: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .list(directory);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
};

// Customer-specific file operations
export const uploadCustomerFile = async (file: File, customerId: string, userId: string) => {
  const filePath = `customers/${customerId}/${Date.now()}-${file.name}`;
  return uploadFile(file, filePath, userId);
};

export const listCustomerFiles = async (customerId: string) => {
  return listFiles(`customers/${customerId}`);
};

export const deleteCustomerFile = async (filePath: string, userId: string) => {
  return deleteFile(filePath, userId);
};
