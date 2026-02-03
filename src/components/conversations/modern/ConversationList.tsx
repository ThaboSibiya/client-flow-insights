import React, { useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import ConversationCard from './ConversationCard';
import type { Conversation } from '@/types/conversations';

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  onArchive?: (id: string) => void;
  onPin?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  loading,
  onArchive,
  onPin,
  onMarkRead
}: ConversationListProps) => {
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!conversations?.length) return;
    
    const currentIndex = selectedId 
      ? conversations.findIndex(c => c.id === selectedId)
      : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < conversations.length - 1 ? currentIndex + 1 : 0;
      onSelect(conversations[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : conversations.length - 1;
      onSelect(conversations[prevIndex].id);
    } else if (e.key === 'e' && selectedId && onArchive) {
      e.preventDefault();
      onArchive(selectedId);
    }
  }, [conversations, selectedId, onSelect, onArchive]);

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No conversations found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Start a new conversation or adjust your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div 
        className="divide-y divide-border/30"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {conversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onSelect={onSelect}
            onArchive={onArchive}
            onPin={onPin}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
