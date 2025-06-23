import React, { useMemo, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageCircle, FileText, User, UserCheck } from 'lucide-react';

interface Conversation {
  id: string;
  type: 'email' | 'whatsapp' | 'internal_chat' | 'form_submission';
  subject?: string | null;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string | null;
  customer_id?: string | null;
  employee_id?: string | null;
  unread_count?: number;
  last_message_preview?: string;
}

interface ConversationsListOptimizedProps {
  conversations: Conversation[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  searchQuery?: string;
}

const ConversationsListOptimized = ({ 
  conversations, 
  selectedId, 
  onSelect, 
  loading,
  searchQuery = ''
}: ConversationsListOptimizedProps) => {
  
  // Memoize icon mapping to prevent recreating on each render
  const typeIcons = useMemo(() => ({
    email: Mail,
    whatsapp: Phone,
    internal_chat: MessageCircle,
    form_submission: FileText,
    default: MessageCircle,
  }), []);

  // Memoize color mapping
  const typeColors = useMemo(() => ({
    email: 'bg-blue-500',
    whatsapp: 'bg-green-500',
    internal_chat: 'bg-purple-500',
    form_submission: 'bg-orange-500',
    default: 'bg-gray-500',
  }), []);

  // Memoize status colors
  const statusColors = useMemo(() => ({
    active: 'default',
    closed: 'secondary',
    archived: 'outline',
    default: 'secondary',
  }), []);

  const getTypeIcon = useCallback((type: string) => {
    return typeIcons[type as keyof typeof typeIcons] || typeIcons.default;
  }, [typeIcons]);

  const getTypeColor = useCallback((type: string) => {
    return typeColors[type as keyof typeof typeColors] || typeColors.default;
  }, [typeColors]);

  const getStatusColor = useCallback((status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.default;
  }, [statusColors]);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 rounded px-1">{part}</mark>;
      }
      return part;
    });
  }, []);

  // Memoize skeleton loader to prevent recreation
  const skeletonLoader = useMemo(() => (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  ), []);

  if (loading) {
    return skeletonLoader;
  }

  if (!conversations?.length) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-quikle-neutral mx-auto mb-4" />
        <p className="text-quikle-neutral">
          {searchQuery ? `No conversations found for "${searchQuery}"` : 'No conversations found'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {conversations.map((conversation) => {
        const Icon = getTypeIcon(conversation.type);
        const isSelected = selectedId === conversation.id;
        
        return (
          <Card
            key={conversation.id}
            className={cn(
              "mb-2 p-3 cursor-pointer transition-all hover:shadow-md border",
              isSelected 
                ? "border-quikle-primary bg-quikle-crystal shadow-md" 
                : "border-quikle-silver/30 hover:border-quikle-silver"
            )}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-quikle-crystal">
                    <User className="h-5 w-5 text-quikle-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center",
                  getTypeColor(conversation.type)
                )}>
                  <Icon className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-quikle-charcoal truncate">
                    {searchQuery ? 
                      highlightText(conversation.subject || conversation.customer_id || conversation.employee_id || 'Unnamed Conversation', searchQuery) :
                      conversation.subject || conversation.customer_id || conversation.employee_id || 'Unnamed Conversation'
                    }
                  </h4>
                  <div className="flex items-center gap-1">
                    {conversation.employee_id && (
                      <UserCheck className="h-3 w-3 text-green-500" />
                    )}
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-quikle-neutral truncate mb-2">
                  {searchQuery && conversation.last_message_preview ?
                    highlightText(conversation.last_message_preview, searchQuery) :
                    conversation.last_message_preview || 'No messages yet'
                  }
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={getStatusColor(conversation.status)}
                    className="text-xs"
                  >
                    {conversation.status}
                  </Badge>
                  {conversation.last_message_at && (
                    <span className="text-xs text-quikle-neutral">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default React.memo(ConversationsListOptimized);
