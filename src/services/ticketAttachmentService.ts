
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logFileAccess } from './auditLogService';

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: string;
}

/**
 * Upload a file attachment for a ticket
 */
export const uploadTicketAttachment = async (
  userId: string,
  ticketId: string,
  file: File
): Promise<TicketAttachment | null> => {
  try {
    // Create a path with user ID as the first folder to maintain RLS security
    const filePath = `${userId}/${ticketId}/${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('ticket-attachments')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Error uploading file:', storageError.message);
      throw storageError;
    }

    await logFileAccess(storageData.path, 'upload');

    // Save attachment record in database
    const { data: attachmentData, error: dbError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        file_name: file.name,
        file_path: storageData.path,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving attachment record:', dbError.message);
      throw dbError;
    }

    return attachmentData;
  } catch (error: any) {
    console.error('Error in uploadTicketAttachment:', error.message);
    toast({
      title: "Error",
      description: `Failed to upload attachment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Get all attachments for a ticket
 */
export const getTicketAttachments = async (
  ticketId: string
): Promise<TicketAttachment[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error.message);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getTicketAttachments:', error.message);
    return [];
  }
};

/**
 * Delete a ticket attachment
 */
export const deleteTicketAttachment = async (
  attachmentId: string,
  filePath: string
): Promise<boolean> => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('ticket-attachments')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError.message);
      throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      console.error('Error deleting attachment record:', dbError.message);
      throw dbError;
    }

    await logFileAccess(filePath, 'delete');

    return true;
  } catch (error: any) {
    console.error('Error in deleteTicketAttachment:', error.message);
    toast({
      title: "Error",
      description: `Failed to delete attachment: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Get public URL for an attachment
 */
export const getAttachmentUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('ticket-attachments')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
