
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Add a comment to a ticket
 */
export const addTicketComment = async (
  ticketId: string,
  userId: string,
  userName: string,
  comment: string,
  isInternal: boolean = false
): Promise<TicketComment | null> => {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        user_name: userName,
        comment,
        is_internal: isInternal,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error.message);
      throw error;
    }

    // Emit comment added event
    ticketEventBus.emit(TICKET_EVENTS.COMMENT_ADDED, { 
      ticketId, 
      comment: data 
    });

    return data;
  } catch (error: any) {
    console.error('Error in addTicketComment:', error.message);
    toast({
      title: "Error",
      description: `Failed to add comment: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Get all comments for a ticket
 */
export const getTicketComments = async (
  ticketId: string
): Promise<TicketComment[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select('id, ticket_id, user_id, user_name, comment, is_internal, created_at, updated_at')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error.message);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getTicketComments:', error.message);
    return [];
  }
};

/**
 * Update a comment
 */
export const updateTicketComment = async (
  commentId: string,
  comment: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ticket_comments')
      .update({ 
        comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error.message);
      throw error;
    }

    // Emit comment updated event
    ticketEventBus.emit(TICKET_EVENTS.COMMENT_UPDATED, { commentId, comment });

    return true;
  } catch (error: any) {
    console.error('Error in updateTicketComment:', error.message);
    toast({
      title: "Error",
      description: `Failed to update comment: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Delete a comment
 */
export const deleteTicketComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ticket_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error.message);
      throw error;
    }

    // Emit comment deleted event
    ticketEventBus.emit(TICKET_EVENTS.COMMENT_DELETED, { commentId });

    return true;
  } catch (error: any) {
    console.error('Error in deleteTicketComment:', error.message);
    toast({
      title: "Error",
      description: `Failed to delete comment: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};
