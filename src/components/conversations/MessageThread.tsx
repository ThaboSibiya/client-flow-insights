
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadStatus } from '@/hooks/useReadStatus';
import MessageThreadHeader from './MessageThreadHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const { user } = useAuth();
  const { messages, conversation, loading, sendMessage } = useMessages(conversationId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { markConversationAsRead, markAllAsRead } = useReadStatus();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, markConversationAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    stopTyping();
    
    await sendMessage({
      content: newMessage,
      message_type: isInternal ? 'internal_note' : 'text',
      sender_type: 'employee',
      sender_name: user?.email || 'Unknown',
      sender_email: user?.email,
    });
    
    setNewMessage('');
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Start typing indicator
    startTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(conversationId);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary mx-auto mb-4"></div>
          <p className="text-quikle-neutral">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages?.filter(msg => !msg.is_read).length || 0;

  return (
    <div className="flex-1 flex flex-col">
      <MessageThreadHeader 
        conversation={conversation}
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              conversationId={conversationId}
              currentUserEmail={user?.email || null}
            />
          ))}
          
          <TypingIndicator typingUsers={typingUsers} />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <MessageInput
        newMessage={newMessage}
        isInternal={isInternal}
        onMessageChange={handleTyping}
        onInternalToggle={() => setIsInternal(!isInternal)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MessageThread;
