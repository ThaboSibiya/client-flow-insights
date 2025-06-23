
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessagesOptimized } from '@/hooks/useMessagesOptimized';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadStatus } from '@/hooks/useReadStatus';
import { useNotifications } from '@/hooks/useNotifications';
import MessageThreadView from './MessageThreadView';
import ConversationErrorBoundary from './ConversationErrorBoundary';
import type { Message } from '@/types/conversations';

interface MessageThreadContainerOptimizedProps {
  conversationId: string;
}

const MessageThreadContainerOptimized = ({ conversationId }: MessageThreadContainerOptimizedProps) => {
  const { user } = useAuth();
  const { conversation, messages, loading, sendMessage, sendingMessage, error } = useMessagesOptimized(conversationId);
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

  const displayMessages = useMemo(() => 
    searchQuery.trim() ? searchResults : messages
  , [searchQuery, searchResults, messages]);
  
  const unreadCount = useMemo(() => 
    messages?.filter((m: Message) => !m.is_read && m.sender_type !== 'employee').length || 0
  , [messages]);

  // Simplified notification effect
  useEffect(() => {
    if (!messages || !user?.email || !Array.isArray(messages)) return;
    
    if (messages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      
      newMessages.forEach((message: Message) => {
        if (message.sender_email !== user.email && message.sender_type !== 'employee') {
          sendMessageNotification({
            conversationId: conversationId,
            messageId: message.id,
            senderName: message.sender_name,
            content: message.content,
            type: 'new_message',
            recipientId: user.id || '',
          });
        }
      });
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
      sender_name: user.email,
      sender_email: user.email,
      attachments: attachments || [],
      attachment_count: attachments?.length || 0,
    };

    try {
      await sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [newMessage, isInternal, user, conversation, sendMessage]);

  const handleMarkAllAsRead = useCallback(() => {
    if (conversationId) {
      markAllAsRead(conversationId);
    }
  }, [conversationId, markAllAsRead]);

  // Show error state if there's an error
  if (error) {
    return (
      <ConversationErrorBoundary>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </ConversationErrorBoundary>
    );
  }

  return (
    <ConversationErrorBoundary>
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
    </ConversationErrorBoundary>
  );
};

export default React.memo(MessageThreadContainerOptimized);
