
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MessageActions from './MessageActions';
import AttachmentPreview from './AttachmentPreview';

interface MessageBubbleProps {
  message: any;
  conversationId: string;
  currentUserEmail: string | null;
}

const MessageBubble = ({ message, conversationId, currentUserEmail }: MessageBubbleProps) => {
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

  const isEdited = message.metadata && typeof message.metadata === 'object' && 
    message.metadata !== null && 'edited' in message.metadata && message.metadata.edited;

  // Parse attachments from the message
  const attachments = message.attachments && Array.isArray(message.attachments) 
    ? message.attachments 
    : [];

  return (
    <div
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
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {message.sender_name}
              </span>
              <span className={`text-xs ${
                message.sender_type === 'employee' ? 'text-white/70' : 'text-quikle-neutral'
              }`}>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          {message.content && (
            <div className={`text-sm mb-2 ${
              message.sender_type === 'employee' ? 'text-white' : 'text-quikle-charcoal'
            }`}>
              {message.content}
            </div>
          )}

          {attachments.length > 0 && (
            <div className="space-y-2 mb-2">
              {attachments.map((attachment: any, index: number) => (
                <AttachmentPreview
                  key={index}
                  attachment={attachment}
                  compact
                />
              ))}
            </div>
          )}
          
          {message.metadata && message.message_type === 'form_data' && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <strong>Form Data:</strong>
              <pre className="mt-1 text-xs">
                {JSON.stringify(message.metadata, null, 2)}
              </pre>
            </div>
          )}

          <MessageActions
            messageId={message.id}
            conversationId={conversationId}
            content={message.content}
            senderEmail={message.sender_email}
            createdAt={message.created_at}
            currentUserEmail={currentUserEmail}
            isEdited={isEdited}
          />
        </CardContent>
      </Card>
      
      {message.sender_type === 'employee' && getSenderAvatar(message)}
    </div>
  );
};

export default MessageBubble;
