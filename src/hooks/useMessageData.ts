
import { useState, useCallback } from 'react';
import { loadMessagesPaginated, loadOlderMessages } from '@/services/messagesPaginationService';
import { messageCacheService } from '@/services/messageCacheService';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';
import { toast } from '@/hooks/use-toast';

export const useMessageData = (conversationId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { mergeWithOptimisticUpdates } = useOptimisticMessages(conversationId);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      // Try to get from cache first
      const cachedMessages = messageCacheService.getCachedMessages(conversationId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setLoading(false);
        return;
      }

      // Load from server with pagination
      const result = await loadMessagesPaginated({
        conversationId,
        pageSize: 30,
      });

      const finalMessages = mergeWithOptimisticUpdates(result.messages, (msg) => msg.id);
      setMessages(finalMessages);
      setHasMoreMessages(result.hasMore);

      // Cache the messages
      messageCacheService.cacheMessages(conversationId, result.messages);
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
        messageCacheService.cacheMessages(conversationId, result.messages);
      }
      
      setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMoreMessages, loadingOlder, messages]);

  return {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    loadMessages,
    loadOlderMessages: loadOlderMessagesHandler,
  };
};
