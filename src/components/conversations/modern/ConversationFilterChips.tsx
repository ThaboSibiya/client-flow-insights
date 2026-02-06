import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageCircle, FileText, Inbox, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConversationType = 'all' | 'email' | 'whatsapp' | 'telegram' | 'internal_chat' | 'form_submission';

interface FilterOption {
  id: ConversationType;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface ConversationFilterChipsProps {
  activeFilter: ConversationType;
  onFilterChange: (filter: ConversationType) => void;
  counts: {
    all: number;
    email: number;
    whatsapp: number;
    telegram: number;
    internal_chat: number;
    form_submission: number;
    unread: number;
  };
}

const ConversationFilterChips = ({
  activeFilter,
  onFilterChange,
  counts
}: ConversationFilterChipsProps) => {
  const filters: FilterOption[] = [
    { id: 'all', label: 'All', icon: <Inbox className="h-3.5 w-3.5" />, count: counts.all },
    { id: 'email', label: 'Email', icon: <Mail className="h-3.5 w-3.5" />, count: counts.email },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="h-3.5 w-3.5" />, count: counts.whatsapp },
    { id: 'telegram', label: 'Telegram', icon: <Send className="h-3.5 w-3.5" />, count: counts.telegram },
    { id: 'internal_chat', label: 'Internal', icon: <MessageCircle className="h-3.5 w-3.5" />, count: counts.internal_chat },
    { id: 'form_submission', label: 'Forms', icon: <FileText className="h-3.5 w-3.5" />, count: counts.form_submission },
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/30 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        const hasItems = filter.count && filter.count > 0;
        
        return (
          <Button
            key={filter.id}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2.5 gap-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
              isActive 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.icon}
            <span>{filter.label}</span>
            {hasItems && !isActive && (
              <Badge 
                variant="secondary" 
                className="h-4 px-1 text-[10px] bg-muted/50"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        );
      })}

      {/* Unread filter - special styling */}
      {counts.unread > 0 && (
        <div className="ml-auto flex-shrink-0">
          <Badge variant="destructive" className="h-6 px-2 text-xs cursor-pointer hover:opacity-90">
            {counts.unread} unread
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ConversationFilterChips;
