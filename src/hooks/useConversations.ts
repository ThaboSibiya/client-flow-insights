
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { loadConversationsPaginated } from '@/services/conversationsPaginationService';

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [unreadCount, setUnreadCount] = useState(0);

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
        pageSize: 20,
        cursor: reset ? undefined : nextCursor,
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

      // Calculate unread count
      const unread = result.conversations.reduce((count, conv) => {
        // This would need to be implemented based on your unread logic
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
  }, [user, nextCursor]);

  const loadMoreConversations = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadConversations(false);
    }
  }, [loadConversations, loadingMore, hasMore]);

  const refreshConversations = useCallback(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Set up real-time subscription for new conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const newConversation = payload.new;
          setConversations(prev => [newConversation, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const updatedConversation = payload.new;
          setConversations(prev =>
            prev.map(conv =>
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadConversations(true);
    }
  }, [user, loadConversations]);

  return {
    conversations,
    loading,
    loadingMore,
    hasMore,
    unreadCount,
    loadMoreConversations,
    refreshConversations,
  };
};
