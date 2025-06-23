import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessagesOptimized } from '@/hooks/useMessagesOptimized';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadStatus } from '@/hooks/useReadStatus';
import { useNotifications } from '@/hooks/useNotifications';
import MessageThreadView from './MessageThreadView';

interface MessageThreadContainerOptimizedProps {
  conversationId: string;
}

const MessageThreadContainerOptimized = ({ conversationId }: MessageThreadContainerOptimizedProps) => {
  const { user } = useAuth();
  const { conversation, messages, loading, sendMessage, sendingMessage } = useMessagesOptimized(conversationId);
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearching, 
    setIsSearching, 
    searchResults, 
    isLoading: searchLoading,
    clearSearch 
  } = useMessageSearch(conversationId);
  
  const [newMessage, setNewMessage] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(false);
  const prevMessagesLengthRef = useRef(0);
  
  const { typingUsers } = useTypingIndicator(conversationId);
  const { markAllAsRead } = useReadStatus();
  const { sendMessageNotification } = useNotifications();

  // Memoize computed values to prevent unnecessary recalculations
  const displayMessages = useMemo(() => 
    searchQuery.trim() ? searchResults : messages
  , [searchQuery, searchResults, messages]);
  
  const unreadCount = useMemo(() => 
    messages?.filter(m => !m.is_read && m.sender_type !== 'employee').length || 0
  , [messages]);

  // Optimized notification effect with proper dependencies
  useEffect(() => {
    if (!messages || !user?.email) return;
    
    if (messages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      
      // Batch notification sending to prevent performance issues
      const notificationsToSend = newMessages.filter(message => 
        message.sender_email !== user.email && message.sender_type !== 'employee'
      );

      if (notificationsToSend.length > 0) {
        // Send notifications in batch with a small delay
        setTimeout(() => {
          notificationsToSend.forEach(message => {
            sendMessageNotification({
              conversationId: conversationId,
              messageId: message.id,
              senderName: message.sender_name,
              content: message.content,
              type: 'new_message',
              recipientId: user.id || '',
            });
          });
        }, 100);
      }
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages?.length, user?.email, user?.id, conversationId, sendMessageNotification]);

  const handleSendMessage = useCallback(async (attachments?: any[]) => {
    if (!newMessage.trim() && (!attachments || attachments.length === 0)) return;
    if (!user || !conversation) return;

    const messageData = {
      content: newMessage.trim(),
      message_type: isInternal ? 'internal_note' : 'reply',
      sender_type: 'employee',
      sender_name: `${user.email}`,
      sender_email: user.email,
      attachments: attachments || [],
      attachment_count: attachments?.length || 0,
    };

    await sendMessage(messageData);
    setNewMessage('');
  }, [newMessage, isInternal, user, conversation, sendMessage]);

  const handleMarkAllAsRead = useCallback(() => {
    if (conversationId) {
      markAllAsRead(conversationId);
    }
  }, [conversationId, markAllAsRead]);

  return (
    <MessageThreadView
      conversation={conversation}
      messages={displayMessages}
      loading={loading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isSearching={isSearching}
      setIsSearching={setIsSearching}
      searchResults={searchResults}
      searchLoading={searchLoading}
      clearSearch={clearSearch}
      typingUsers={typingUsers}
      unreadCount={unreadCount}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      isInternal={isInternal}
      setIsInternal={setIsInternal}
      onSendMessage={handleSendMessage}
      onMarkAllAsRead={handleMarkAllAsRead}
      conversationId={conversationId}
    />
  );
};

export default React.memo(MessageThreadContainerOptimized);
