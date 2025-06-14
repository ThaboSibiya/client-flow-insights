
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadStatus } from '@/hooks/useReadStatus';
import { useNotifications } from '@/hooks/useNotifications';
import MessageThreadView from './MessageThreadView';

interface MessageThreadContainerProps {
  conversationId: string;
}

const MessageThreadContainer = ({ conversationId }: MessageThreadContainerProps) => {
  const { user } = useAuth();
  const { conversation, messages, loading, sendMessage, sendingMessage } = useMessages(conversationId);
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

  const displayMessages = searchQuery.trim() ? searchResults : messages;
  const unreadCount = messages?.filter(m => !m.is_read && m.sender_type !== 'employee').length || 0;

  // Send notifications for new messages
  useEffect(() => {
    if (messages && messages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      
      newMessages.forEach(message => {
        // Only send notifications for messages from other users
        if (message.sender_email !== user?.email && message.sender_type !== 'employee') {
          sendMessageNotification({
            conversationId: conversationId,
            messageId: message.id,
            senderName: message.sender_name,
            content: message.content,
            type: 'new_message',
            recipientId: user?.id || '',
          });
        }
      });
    }
    
    if (messages) {
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, user?.email, user?.id, conversationId, sendMessageNotification]);

  const handleSendMessage = async (attachments?: any[]) => {
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
  };

  const handleMarkAllAsRead = () => {
    if (conversationId) {
      markAllAsRead(conversationId);
    }
  };

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

export default MessageThreadContainer;
