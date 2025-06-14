
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from 'lucide-react';
import ConversationActions from './ConversationActions';

interface MessageThreadHeaderProps {
  conversation: any;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const MessageThreadHeader = ({ 
  conversation, 
  unreadCount, 
  onMarkAllAsRead 
}: MessageThreadHeaderProps) => {
  return (
    <div className="bg-white border-b border-quikle-silver/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-quikle-charcoal">
            {conversation?.subject || 'Conversation'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {conversation?.type}
            </Badge>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <ConversationActions
            conversationId={conversation?.id}
            currentStatus={conversation?.status}
            assignedTo={conversation?.employee_id}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageThreadHeader;
