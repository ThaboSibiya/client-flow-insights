
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  typingUsers: string[];
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
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Conversation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {conversation.subject || 'Conversation'}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {conversation.type} • {conversation.status}
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" onClick={onMarkAllAsRead} className="cursor-pointer">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className="max-w-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.sender_name}</span>
                      <Badge variant={message.sender_type === 'employee' ? 'default' : 'secondary'}>
                        {message.sender_type}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button onClick={() => onSendMessage()} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThreadView;
