
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { User, Eye, MessageSquare, MoreVertical, Reply } from 'lucide-react';
import { cn } from "@/lib/utils";
import AttachmentPreview from './AttachmentPreview';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: any;
  isSearchResult?: boolean;
  searchQuery?: string;
}

const MessageBubble = ({ message, isSearchResult = false, searchQuery = '' }: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const isInternal = message.message_type === 'internal_note';
  const isEmployee = message.sender_type === 'employee';
  
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 rounded px-1">{part}</mark>;
      }
      return part;
    });
  };

  return (
    <div 
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors",
        isEmployee ? "ml-12" : "mr-12",
        isInternal && "bg-gray-50 border-l-4 border-gray-400",
        isSearchResult && "ring-2 ring-quikle-primary/20 bg-quikle-crystal/30"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isEmployee && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-quikle-charcoal">
            {message.sender_name}
          </span>
          
          {isInternal && (
            <Badge variant="secondary" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Internal
            </Badge>
          )}
          
          <span className="text-xs text-quikle-neutral">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          
          {isSearchResult && (
            <Badge variant="outline" className="text-xs">
              Search Result
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-quikle-charcoal leading-relaxed mb-2">
          {searchQuery ? highlightText(message.content, searchQuery) : message.content}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mt-3">
            {message.attachments.map((attachment: any, index: number) => (
              <AttachmentPreview
                key={index}
                attachment={attachment}
                showDelete={false}
                compact={false}
              />
            ))}
          </div>
        )}
        
        {!message.is_read && !isEmployee && (
          <div className="flex items-center gap-1 mt-2">
            <div className="h-2 w-2 bg-quikle-primary rounded-full"></div>
            <span className="text-xs text-quikle-primary">Unread</span>
          </div>
        )}
      </div>
      
      {showActions && (
        <MessageActions message={message} />
      )}
      
      {isEmployee && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-quikle-primary text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
