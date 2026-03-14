
import { supabase } from '@/integrations/supabase/client';

export interface ConversationsPaginationOptions {
  pageSize?: number;
  cursor?: string;
  workspaceId?: string | null;
  filters?: {
    type?: string;
    status?: string;
    searchQuery?: string;
  };
  sortBy?: 'last_message_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedConversations {
  conversations: any[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

/**
 * Load conversations with pagination and filtering
 */
export const loadConversationsPaginated = async (
  options: ConversationsPaginationOptions = {}
): Promise<PaginatedConversations> => {
  const {
    pageSize = 20,
    cursor,
    workspaceId,
    filters = {},
    sortBy = 'last_message_at',
    sortOrder = 'desc',
  } = options;

  try {
    let query = supabase
      .from('conversations')
      .select('*, customers(name, email, phone)', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(pageSize + 1);

    // Apply filters
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.searchQuery) {
      query = query.or(`subject.ilike.%${filters.searchQuery}%`);
    }

    // Apply cursor-based pagination
    if (cursor) {
      if (sortOrder === 'desc') {
        query = query.lt(sortBy, cursor);
      } else {
        query = query.gt(sortBy, cursor);
      }
    }

    const { data: conversations, error, count } = await query;

    if (error) throw error;

    const hasMore = conversations && conversations.length > pageSize;
    const resultConversations = hasMore ? conversations.slice(0, pageSize) : conversations || [];

    const nextCursor = resultConversations.length > 0
      ? resultConversations[resultConversations.length - 1][sortBy]
      : undefined;

    return {
      conversations: resultConversations,
      hasMore: hasMore || false,
      nextCursor,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('Error loading paginated conversations:', error);
    return {
      conversations: [],
      hasMore: false,
      totalCount: 0,
    };
  }
};

/**
 * Search conversations with pagination
 */
export const searchConversationsPaginated = async (
  searchQuery: string,
  options: Omit<ConversationsPaginationOptions, 'filters'> = {}
): Promise<PaginatedConversations> => {
  return loadConversationsPaginated({
    ...options,
    filters: { searchQuery },
  });
};
