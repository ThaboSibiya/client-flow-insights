
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { loadMessagesPaginated, loadOlderMessages } from '@/services/messagesPaginationService';
import { messageCacheService } from '@/services/messageCacheService';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const { sendMessageOptimistically, mergeWithOptimisticUpdates } = useOptimisticMessages(conversationId);

  // Load conversation details
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation details.',
        variant: 'destructive',
      });
    }
  }, [conversationId]);

  // Load initial messages with caching
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

  // Load older messages (pagination)
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

  // Send message with optimistic updates
  const sendMessage = useCallback(async (messageData: any) => {
    if (!user || !conversationId) return;

    setSendingMessage(true);
    
    try {
      const result = await sendMessageOptimistically(messageData, async () => {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: messageData.content,
            sender_type: messageData.sender_type,
            sender_name: messageData.sender_name,
            sender_email: messageData.sender_email,
            message_type: messageData.message_type,
            attachments: messageData.attachments || [],
            attachment_count: messageData.attachment_count || 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      // Update local state with real message
      if (result) {
        setMessages(prev => {
          const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
          return [...withoutTemp, result];
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSendingMessage(false);
    }
  }, [user, conversationId, sendMessageOptimistically]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Only add if not from current user (avoid duplicates from optimistic updates)
          if (newMessage.sender_email !== user?.email) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
            
            // Update cache
            messageCacheService.cacheMessage(conversationId, newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.email]);

  // Initial load
  useEffect(() => {
    if (conversationId) {
      loadConversation();
      loadMessages();
    }
  }, [conversationId, loadConversation, loadMessages]);

  return {
    conversation,
    messages,
    loading,
    loadingOlder,
    hasMoreMessages,
    sendingMessage,
    sendMessage,
    loadOlderMessages: loadOlderMessagesHandler,
    refreshMessages: loadMessages,
  };
};
