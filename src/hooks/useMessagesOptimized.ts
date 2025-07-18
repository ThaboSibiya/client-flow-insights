
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
    error,
    loadMessages,
    loadOlderMessages,
  } = useMessageDataOptimized(conversationId);
  const { sendingMessage, sendMessage } = useMessageSender(conversationId);

  useRealtimeMessagesOptimized(conversationId, setMessages);

  // Removed artificial 100ms delay - load immediately
  useEffect(() => {
    if (conversationId) {
      loadConversation();
      loadMessages();
    }
  }, [conversationId, loadConversation, loadMessages]);

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
    error,
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
    error,
  ]);
};
