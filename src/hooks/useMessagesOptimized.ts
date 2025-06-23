
import { useEffect, useMemo } from 'react';
import { useConversationData } from './useConversationData';
import { useMessageDataOptimized } from './useMessageDataOptimized';
import { useMessageSender } from './useMessageSender';
import { useRealtimeMessagesOptimized } from './useRealtimeMessagesOptimized';

export const useMessagesOptimized = (conversationId: string) => {
  const { conversation, loadConversation } = useConversationData(conversationId);
  const {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    loadMessages,
    loadOlderMessages,
  } = useMessageDataOptimized(conversationId);
  const { sendingMessage, sendMessage } = useMessageSender(conversationId);

  // Set up real-time subscription with optimization
  useRealtimeMessagesOptimized(conversationId, setMessages);

  // Optimized initial load with delay
  useEffect(() => {
    if (conversationId) {
      const timer = setTimeout(() => {
        loadConversation();
        loadMessages();
      }, 100); // Small delay to prevent blocking
      
      return () => clearTimeout(timer);
    }
  }, [conversationId, loadConversation, loadMessages]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    conversation,
    messages,
    loading,
    loadingOlder,
    hasMoreMessages,
    sendingMessage,
    sendMessage,
    loadOlderMessages,
    refreshMessages: loadMessages,
  }), [
    conversation,
    messages,
    loading,
    loadingOlder,
    hasMoreMessages,
    sendingMessage,
    sendMessage,
    loadOlderMessages,
    loadMessages,
  ]);
};
