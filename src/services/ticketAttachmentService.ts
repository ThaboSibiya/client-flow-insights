
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadFile, downloadFile } from './storageService';
import { logFileAccess } from './auditLogService';

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  user_id: string;
  uploaded_at: string;
}

interface UploadAttachmentParams {
  file: File;
  ticketId: string;
  userId: string;
}

export const uploadTicketAttachment = async (userId: string, ticketId: string, file: File) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `tickets/${ticketId}/${fileName}`;
    
    // Upload file to storage
    const uploadData = await uploadFile(file, filePath, userId);
    
    // Save attachment record - using correct field names that match database
    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Log file access
    await logFileAccess(userId, filePath, 'upload');

    toast({
      title: "Success",
      description: "Attachment uploaded successfully",
    });

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

export const deleteTicketAttachment = async (attachmentId: string, filePath: string) => {
  try {
    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('attachments')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Delete attachment record
    const { error: removeError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (removeError) throw removeError;

    return true;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return false;
  }
};

export const getTicketAttachments = async (ticketId: string) => {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching attachments:', error);
    toast({
      title: "Fetch Error",
      description: "Failed to fetch attachments",
      variant: "destructive",
    });
    return [];
  }
};

export const downloadTicketAttachment = async (attachmentId: string, userId: string) => {
  try {
    // Get attachment info
    const { data: attachment, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (error) throw error;

    // Download file
    const fileBlob = await downloadFile(attachment.file_path, userId);
    
    // Create download link
    const url = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log file access
    await logFileAccess(userId, attachment.file_path, 'download');

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

export const getAttachmentUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('attachments')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
