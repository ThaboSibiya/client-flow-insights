
import { useEffect } from 'react';
import { useConversationData } from './useConversationData';
import { useMessageData } from './useMessageData';
import { useMessageSender } from './useMessageSender';
import { useRealtimeMessages } from './useRealtimeMessages';

export const useMessages = (conversationId: string) => {
  const { conversation, loadConversation } = useConversationData(conversationId);
  const {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreMessages,
    loadMessages,
    loadOlderMessages,
  } = useMessageData(conversationId);
  const { sendingMessage, sendMessage } = useMessageSender(conversationId);

  // Set up real-time subscription
  useRealtimeMessages(conversationId, setMessages);

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
    loadOlderMessages,
    refreshMessages: loadMessages,
  };
};
