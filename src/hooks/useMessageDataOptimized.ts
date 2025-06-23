
import { useState, useCallback, useMemo } from 'react';
import { loadMessagesPaginated, loadOlderMessages } from '@/services/messagesPaginationService';
import { simplifiedMessageCache } from '@/services/simplifiedMessageCache';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';
import { toast } from '@/hooks/use-toast';
import type { Message } from '@/types/conversations';

export const useMessageDataOptimized = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mergeWithOptimisticUpdates } = useOptimisticMessages(conversationId);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Check cache first
      const cachedMessages = simplifiedMessageCache.getCachedMessages(conversationId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setLoading(false);
        return;
      }

      // Load from server
      const result = await loadMessagesPaginated({
        conversationId,
        pageSize: 20,
      });

      const finalMessages = mergeWithOptimisticUpdates(result.messages, (msg) => msg.id);
      setMessages(finalMessages);
      setHasMoreMessages(result.hasMore);

      // Cache the results
      simplifiedMessageCache.cacheMessages(conversationId, result.messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', error);
      
      toast({
        title: 'Error',
        description: errorMessage,
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
        simplifiedMessageCache.cacheMessages(conversationId, result.messages);
      }
      
      setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error('Error loading older messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load older messages',
        variant: 'destructive',
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMoreMessages, loadingOlder, messages]);

  return useMemo(() => ({
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    error,
    loadMessages,
    loadOlderMessages: loadOlderMessagesHandler,
  }), [
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    error,
    loadMessages,
    loadOlderMessagesHandler,
  ]);
};
