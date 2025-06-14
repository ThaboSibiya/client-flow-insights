
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone, MessageCircle, FileText, User } from 'lucide-react';

interface Conversation {
  id: string;
  type: 'email' | 'whatsapp' | 'internal_chat' | 'form_submission';
  subject?: string;
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  customer_name?: string;
  employee_name?: string;
  unread_count?: number;
  last_message_preview?: string;
}

interface ConversationsListProps {
  conversations: Conversation[] | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: string;
  searchQuery: string;
  loading: boolean;
}

const ConversationsList = ({ 
  conversations, 
  selectedId, 
  onSelect, 
  filter, 
  searchQuery, 
  loading 
}: ConversationsListProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'whatsapp': return Phone;
      case 'internal_chat': return MessageCircle;
      case 'form_submission': return FileText;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'whatsapp': return 'bg-green-500';
      case 'internal_chat': return 'bg-purple-500';
      case 'form_submission': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredConversations = conversations?.filter(conv => {
    const matchesFilter = filter === 'all' || conv.type === filter;
    const matchesSearch = !searchQuery || 
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
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
    );
  }

  if (!filteredConversations?.length) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-quikle-neutral mx-auto mb-4" />
        <p className="text-quikle-neutral">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {filteredConversations.map((conversation) => {
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
                    {conversation.subject || conversation.customer_name || conversation.employee_name || 'Unnamed Conversation'}
                  </h4>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-quikle-neutral truncate mb-2">
                  {conversation.last_message_preview || 'No messages yet'}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={conversation.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {conversation.status}
                  </Badge>
                  <span className="text-xs text-quikle-neutral">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationsList;
