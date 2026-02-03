import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadCount: number;
  onNewConversation: () => void;
}

const ConversationHeader = ({
  searchQuery,
  onSearchChange,
  unreadCount,
  onNewConversation
}: ConversationHeaderProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        onSearchChange('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Title with unread badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Conversations</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>

      {/* Search Bar - Prominent */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search conversations... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "pl-9 pr-8 h-9 bg-muted/30 border-border/50",
            "focus:bg-background focus:border-primary/50",
            "placeholder:text-muted-foreground/70"
          )}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* New Conversation Button */}
      <Button
        size="sm"
        className="h-9 gap-1.5 flex-shrink-0"
        onClick={onNewConversation}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </Button>
    </div>
  );
};

export default ConversationHeader;
