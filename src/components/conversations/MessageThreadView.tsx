
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import MessageThreadHeader from './MessageThreadHeader';
import MessageSearch from './MessageSearch';
import TypingIndicator from './TypingIndicator';
import MessageThreadLoader from './MessageThreadLoader';

interface MessageThreadViewProps {
  conversation: any;
  messages: any[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchResults: any[];
  searchLoading: boolean;
  clearSearch: () => void;
  typingUsers: any[];
  unreadCount: number;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isInternal: boolean;
  setIsInternal: (internal: boolean) => void;
  onSendMessage: (attachments?: any[]) => void;
  onMarkAllAsRead: () => void;
  conversationId: string;
}

const MessageThreadView = ({
  conversation,
  messages,
  loading,
  searchQuery,
  setSearchQuery,
  isSearching,
  setIsSearching,
  searchResults,
  searchLoading,
  clearSearch,
  typingUsers,
  unreadCount,
  newMessage,
  setNewMessage,
  isInternal,
  setIsInternal,
  onSendMessage,
  onMarkAllAsRead,
  conversationId,
}: MessageThreadViewProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current && !searchQuery.trim()) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, searchQuery]);

  if (loading) {
    return <MessageThreadLoader />;
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
        onMarkAllAsRead={onMarkAllAsRead}
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
          
          {messages?.map((message) => (
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
          
          {messages?.length === 0 && !searchQuery.trim() && (
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
          onSendMessage={onSendMessage}
        />
      )}
    </div>
  );
};

export default MessageThreadView;
