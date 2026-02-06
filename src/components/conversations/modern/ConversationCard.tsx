import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageCircle, FileText, Archive, Pin, Check, User, Send } from 'lucide-react';
import type { Conversation } from '@/types/conversations';

// Telegram icon component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Wrapper component to use TelegramIcon as a Lucide-compatible icon
const TelegramIconWrapper = ({ className }: { className?: string }) => (
  <TelegramIcon className={className} />
);

interface ConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onArchive?: (id: string) => void;
  onPin?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const typeConfig = {
  email: { icon: Mail, color: 'bg-blue-500' },
  whatsapp: { icon: Phone, color: 'bg-green-500' },
  telegram: { icon: TelegramIconWrapper, color: 'bg-sky-500' },
  internal_chat: { icon: MessageCircle, color: 'bg-purple-500' },
  form_submission: { icon: FileText, color: 'bg-orange-500' },
} as const;

const ConversationCard = ({
  conversation,
  isSelected,
  onSelect,
  onArchive,
  onPin,
  onMarkRead
}: ConversationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const config = typeConfig[conversation.type] || { icon: MessageCircle, color: 'bg-muted' };
  const TypeIcon = config.icon;
  const hasUnread = conversation.unread_count && conversation.unread_count > 0;
  
  const displayName = conversation.subject || 
    conversation.customer_id || 
    conversation.employee_id || 
    'Unnamed Conversation';

  const timeAgo = conversation.last_message_at 
    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
    : '';

  return (
    <div
      className={cn(
        "group relative px-3 py-2.5 cursor-pointer transition-all border-l-2",
        isSelected 
          ? "bg-primary/5 border-l-primary" 
          : "border-l-transparent hover:bg-muted/30",
        hasUnread && !isSelected && "bg-primary/[0.02]"
      )}
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with type indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center border-2 border-background",
            config.color
          )}>
            <TypeIcon className="h-2 w-2 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn(
              "text-sm truncate",
              hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
            )}>
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timeAgo}
            </span>
          </div>
          
          <p className={cn(
            "text-xs truncate",
            hasUnread ? "text-foreground/80" : "text-muted-foreground"
          )}>
            {conversation.last_message_preview || 'No messages yet'}
          </p>
        </div>

        {/* Unread indicator */}
        {hasUnread && !isHovered && (
          <div className="flex-shrink-0 self-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>

      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-background/95 backdrop-blur-sm rounded-md border border-border/50 shadow-sm p-0.5">
          {onMarkRead && hasUnread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(conversation.id);
              }}
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          {onPin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onPin(conversation.id);
              }}
              title="Pin"
            >
              <Pin className="h-3 w-3" />
            </Button>
          )}
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation.id);
              }}
              title="Archive"
            >
              <Archive className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ConversationCard);
