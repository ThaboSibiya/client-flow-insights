
import { useState, useCallback, useMemo } from 'react';
import { loadMessagesPaginated, loadOlderMessages } from '@/services/messagesPaginationService';
import { messageCacheService } from '@/services/messageCacheService';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';
import { toast } from '@/hooks/use-toast';

export const useMessageDataOptimized = (conversationId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { mergeWithOptimisticUpdates } = useOptimisticMessages(conversationId);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      // Non-blocking cache check
      setTimeout(async () => {
        const cachedMessages = messageCacheService.getCachedMessages(conversationId);
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
          setLoading(false);
          return;
        }

        // Load from server with reduced page size for faster initial load
        const result = await loadMessagesPaginated({
          conversationId,
          pageSize: 20, // Reduced from 30
        });

        const finalMessages = mergeWithOptimisticUpdates(result.messages, (msg) => msg.id);
        setMessages(finalMessages);
        setHasMoreMessages(result.hasMore);

        // Non-blocking cache operation
        setTimeout(() => {
          messageCacheService.cacheMessages(conversationId, result.messages);
        }, 0);
      }, 0);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, mergeWithOptimisticUpdates]);

  const loadOlderMessagesHandler = useCallback(async () => {
    if (!conversationId || !hasMoreMessages || loadingOlder || messages.length === 0) return;

    setLoadingOlder(true);
    try {
      const oldestMessage = messages[0];
      const result = await loadOlderMessages(conversationId, oldestMessage.created_at);

      if (result.messages.length > 0) {
        setMessages(prev => [...result.messages, ...prev]);
        // Non-blocking cache operation
        setTimeout(() => {
          messageCacheService.cacheMessages(conversationId, result.messages);
        }, 0);
      }
      
      setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMoreMessages, loadingOlder, messages]);

  // Memoize return object
  return useMemo(() => ({
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    loadMessages,
    loadOlderMessages: loadOlderMessagesHandler,
  }), [
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    loadMessages,
    loadOlderMessagesHandler,
  ]);
};
