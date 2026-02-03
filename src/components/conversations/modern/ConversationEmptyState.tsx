import React from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationEmptyStateProps {
  hasConversations: boolean;
  onNewConversation: () => void;
}

const ConversationEmptyState = ({ 
  hasConversations, 
  onNewConversation 
}: ConversationEmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/10">
      <div className="text-center max-w-sm px-6">
        <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        
        <h3 className="text-lg font-medium text-foreground mb-2">
          {hasConversations ? 'Select a conversation' : 'No conversations yet'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6">
          {hasConversations 
            ? 'Choose a conversation from the list to view messages and respond.'
            : 'Start your first conversation to connect with customers and team members.'
          }
        </p>

        {hasConversations ? (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Use arrow keys to navigate</span>
          </div>
        ) : (
          <Button onClick={onNewConversation}>
            Start a conversation
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConversationEmptyState;
