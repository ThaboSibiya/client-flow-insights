
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MoreVertical, 
  Search, 
  ArrowDown, 
  Phone, 
  Video,
  Archive,
  Star,
  Bell,
  BellOff
} from 'lucide-react';
import { useMessagesOptimized } from '@/hooks/useMessagesOptimized';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import MessageBubble from './MessageBubble';
import MessageSearch from './MessageSearch';
import TypingIndicator from './TypingIndicator';
import EnhancedMessageInput from './EnhancedMessageInput';
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const { user } = useAuth();
  const {
    conversation,
    messages,
    loading,
    sendMessage,
    sendingMessage,
    loadOlderMessages,
    hasMoreMessages,
    error
  } = useMessagesOptimized(conversationId);

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);

  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && !loading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages?.length, loading]);

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (attachments?: any[]) => {
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLastMessage = () => {
    if (!messages || messages.length === 0) return '';
    return messages[messages.length - 1]?.content || '';
  };

  // Handle typing indicators
  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  if (loading && (!messages || messages.length === 0)) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-quikle-silver/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-16 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-destructive mb-4">Error loading conversation: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-quikle-neutral">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-quikle-crystal/30">
      {/* Header */}
      <div className="bg-white border-b border-quikle-silver/30 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 bg-quikle-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-medium text-sm">
                {conversation.type?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-quikle-charcoal truncate">
                {conversation.subject || 'Conversation'}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                  {conversation.status}
                </Badge>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile: Fewer buttons */}
            <div className="md:hidden flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Desktop: Full action bar */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <MessageSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
          searchResults={[]}
          isLoading={false}
          onClearSearch={() => setSearchQuery('')}
        />
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 relative" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {/* Load More Button */}
          {hasMoreMessages && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={loadOlderMessages}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load older messages'}
              </Button>
            </div>
          )}

          {/* Messages */}
          {messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              searchQuery={searchQuery}
            />
          ))}

          {/* Typing Indicator */}
          <TypingIndicator typingUsers={typingUsers} />
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            className="absolute bottom-4 right-4 rounded-full h-10 w-10 p-0 shadow-lg"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </ScrollArea>

      {/* Enhanced Message Input */}
      <EnhancedMessageInput
        newMessage={newMessage}
        isInternal={isInternal}
        conversationId={conversationId}
        conversationType={conversation.type || 'email'}
        lastMessage={getLastMessage()}
        onMessageChange={handleMessageChange}
        onInternalToggle={() => setIsInternal(!isInternal)}
        onSendMessage={handleSendMessage}
        disabled={sendingMessage}
      />
    </div>
  );
};

export default MessageThread;
