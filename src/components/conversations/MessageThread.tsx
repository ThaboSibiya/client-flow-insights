
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import MessageThreadHeader from './MessageThreadHeader';
import MessageSearch from './MessageSearch';
import TypingIndicator from './TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { useAuth } from '@/context/AuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadStatus } from '@/hooks/useReadStatus';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
  
  const { typingUsers } = useTypingIndicator(conversationId);
  const { markAllAsRead } = useReadStatus();

  const displayMessages = searchQuery.trim() ? searchResults : messages;
  const unreadCount = messages?.filter(m => !m.is_read && m.sender_type !== 'employee').length || 0;

  useEffect(() => {
    if (scrollAreaRef.current && !searchQuery.trim()) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, searchQuery]);

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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-quikle-neutral">Conversation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageThreadHeader 
        conversation={conversation} 
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      
      <MessageSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearching}
        onToggleSearch={() => setIsSearching(!isSearching)}
        searchResults={searchResults}
        isLoading={searchLoading}
        onClearSearch={clearSearch}
      />
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {searchQuery.trim() && (
            <div className="text-center py-2">
              <span className="text-sm text-quikle-neutral bg-quikle-crystal px-3 py-1 rounded-full">
                {searchLoading ? 'Searching...' : `${searchResults.length} messages found`}
              </span>
            </div>
          )}
          
          {displayMessages?.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              isSearchResult={!!searchQuery.trim()}
              searchQuery={searchQuery}
            />
          ))}
          
          {typingUsers.length > 0 && !searchQuery.trim() && (
            <TypingIndicator typingUsers={typingUsers} />
          )}
          
          {displayMessages?.length === 0 && !searchQuery.trim() && (
            <div className="text-center py-8">
              <p className="text-quikle-neutral">No messages in this conversation yet.</p>
            </div>
          )}
          
          {searchQuery.trim() && searchResults.length === 0 && !searchLoading && (
            <div className="text-center py-8">
              <p className="text-quikle-neutral">No messages found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {!searchQuery.trim() && (
        <MessageInput
          newMessage={newMessage}
          isInternal={isInternal}
          conversationId={conversationId}
          onMessageChange={setNewMessage}
          onInternalToggle={() => setIsInternal(!isInternal)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default MessageThread;
