
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { loadConversationsPaginated } from '@/services/conversationsPaginationService';
import { useDebounce } from '@/hooks/useDebounce';

export const useConversationsOptimized = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    searchQuery: '',
  });

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.searchQuery, 300);

  const loadConversations = useCallback(async (reset = false) => {
    if (!user) return;

    if (reset) {
      setLoading(true);
      setNextCursor(undefined);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await loadConversationsPaginated({
        pageSize: 10, // Reduced from 20 for faster initial load
        cursor: reset ? undefined : nextCursor,
        filters: {
          type: filters.type,
          searchQuery: debouncedSearch,
        },
        sortBy: 'last_message_at',
        sortOrder: 'desc',
      });

      if (reset) {
        setConversations(result.conversations);
      } else {
        setConversations(prev => [...prev, ...result.conversations]);
      }

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);

      // Calculate unread count more efficiently
      const unread = result.conversations.reduce((count, conv) => {
        return count + (conv.unread_count || 0);
      }, 0);
      
      if (reset) {
        setUnreadCount(unread);
      } else {
        setUnreadCount(prev => prev + unread);
      }

    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, filters.type, debouncedSearch, nextCursor]);

  // Memoized filter and load functions
  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const loadMoreConversations = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadConversations(false);
    }
  }, [loadConversations, loadingMore, hasMore]);

  const refreshConversations = useCallback(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Initial load with delay to prevent blocking
  useEffect(() => {
    if (user) {
      // Small delay to allow UI to render first
      const timer = setTimeout(() => {
        loadConversations(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, filters.type, debouncedSearch]);

  return {
    conversations,
    loading,
    loadingMore,
    hasMore,
    unreadCount,
    filters,
    updateFilter,
    loadMoreConversations,
    refreshConversations,
  };
};
