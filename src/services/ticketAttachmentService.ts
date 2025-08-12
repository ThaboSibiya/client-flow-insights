import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadFile, downloadFile } from './storageService';
import { logFileAccess } from './auditLogService';

interface UploadAttachmentParams {
  file: File;
  ticketId: string;
  userId: string;
}

export const uploadTicketAttachment = async ({ file, ticketId, userId }: UploadAttachmentParams) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `tickets/${ticketId}/${fileName}`;
    
    // Upload file to storage
    const uploadData = await uploadFile(file, filePath, userId);
    
    // Save attachment record
    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
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

interface DeleteAttachmentParams {
  attachmentId: string;
  userId: string;
}

export const deleteTicketAttachment = async ({ attachmentId, userId }: DeleteAttachmentParams) => {
  try {
    // Get attachment info
    const { data: attachment, error: selectError } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (selectError) throw selectError;

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_path]);

    if (deleteError) throw deleteError;

    // Delete attachment record
    const { error: removeError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (removeError) throw removeError;

     // Log file access
     await logFileAccess(userId, attachment.file_path, 'delete');

    toast({
      title: "Success",
      description: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    toast({
      title: "Delete Error",
      description: "Failed to delete attachment",
      variant: "destructive",
    });
    throw error;
  }
};

export const getTicketAttachments = async (ticketId: string) => {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

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
