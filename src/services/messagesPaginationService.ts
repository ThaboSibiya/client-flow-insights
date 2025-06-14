
import { supabase } from '@/integrations/supabase/client';

export interface MessagesPaginationOptions {
  conversationId: string;
  pageSize?: number;
  cursor?: string;
  direction?: 'before' | 'after';
}

export interface PaginatedMessages {
  messages: any[];
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Load messages with pagination for large conversations
 */
export const loadMessagesPaginated = async (
  options: MessagesPaginationOptions
): Promise<PaginatedMessages> => {
  const { conversationId, pageSize = 20, cursor, direction = 'before' } = options;

  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1); // Get one extra to check if there are more

    // Apply cursor-based pagination
    if (cursor) {
      if (direction === 'before') {
        query = query.lt('created_at', cursor);
      } else {
        query = query.gt('created_at', cursor);
        query = query.order('created_at', { ascending: true });
      }
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    const hasMore = messages && messages.length > pageSize;
    const resultMessages = hasMore ? messages.slice(0, pageSize) : messages || [];

    // If we were going forward, reverse the order to maintain chronological order
    if (direction === 'after') {
      resultMessages.reverse();
    }

    const nextCursor = resultMessages.length > 0 
      ? resultMessages[resultMessages.length - 1].created_at 
      : undefined;
    
    const prevCursor = resultMessages.length > 0 
      ? resultMessages[0].created_at 
      : undefined;

    return {
      messages: resultMessages,
      hasMore: hasMore || false,
      nextCursor,
      prevCursor,
    };
  } catch (error) {
    console.error('Error loading paginated messages:', error);
    return {
      messages: [],
      hasMore: false,
    };
  }
};

/**
 * Load older messages (scroll up)
 */
export const loadOlderMessages = async (
  conversationId: string,
  oldestMessageDate: string,
  pageSize = 20
): Promise<PaginatedMessages> => {
  return loadMessagesPaginated({
    conversationId,
    pageSize,
    cursor: oldestMessageDate,
    direction: 'before',
  });
};

/**
 * Load newer messages (scroll down or refresh)
 */
export const loadNewerMessages = async (
  conversationId: string,
  newestMessageDate: string,
  pageSize = 20
): Promise<PaginatedMessages> => {
  return loadMessagesPaginated({
    conversationId,
    pageSize,
    cursor: newestMessageDate,
    direction: 'after',
  });
};
