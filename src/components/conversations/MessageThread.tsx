
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Archive, 
  Trash2,
  User,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const { user } = useAuth();
  const { messages, conversation, loading, sendMessage } = useMessages(conversationId);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage({
      content: newMessage,
      message_type: isInternal ? 'internal_note' : 'text',
      sender_type: 'employee',
      sender_name: user?.email || 'Unknown',
      sender_email: user?.email,
    });
    
    setNewMessage('');
  };

  const getSenderAvatar = (message: any) => {
    const initial = message.sender_name?.charAt(0)?.toUpperCase() || 'U';
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback className={
          message.sender_type === 'customer' 
            ? 'bg-blue-100 text-blue-600' 
            : message.sender_type === 'system'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-quikle-crystal text-quikle-primary'
        }>
          {message.sender_type === 'system' ? <Bot className="h-4 w-4" /> : initial}
        </AvatarFallback>
      </Avatar>
    );
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Conversation Header */}
      <div className="bg-white border-b border-quikle-silver/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-quikle-charcoal">
              {conversation?.subject || 'Conversation'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={conversation?.status === 'active' ? 'default' : 'secondary'}>
                {conversation?.status}
              </Badge>
              <Badge variant="outline">
                {conversation?.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender_type === 'employee' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender_type !== 'employee' && getSenderAvatar(message)}
              
              <Card className={`max-w-[70%] ${
                message.sender_type === 'employee' 
                  ? 'bg-quikle-primary text-white' 
                  : message.message_type === 'internal_note'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white'
              }`}>
                <CardContent className="p-3">
                  {message.message_type === 'internal_note' && (
                    <Badge className="mb-2 text-xs" variant="outline">
                      Internal Note
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.sender_name}
                    </span>
                    <span className={`text-xs ${
                      message.sender_type === 'employee' ? 'text-white/70' : 'text-quikle-neutral'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className={`text-sm ${
                    message.sender_type === 'employee' ? 'text-white' : 'text-quikle-charcoal'
                  }`}>
                    {message.content}
                  </div>
                  
                  {message.metadata && message.message_type === 'form_data' && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <strong>Form Data:</strong>
                      <pre className="mt-1 text-xs">
                        {JSON.stringify(message.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {message.sender_type === 'employee' && getSenderAvatar(message)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t border-quikle-silver/30 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={isInternal ? "default" : "outline"}
              size="sm"
              onClick={() => setIsInternal(!isInternal)}
              className={isInternal ? "bg-gray-600 hover:bg-gray-700" : ""}
            >
              {isInternal ? "Internal Note" : "Public Reply"}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-quikle-primary hover:bg-quikle-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
