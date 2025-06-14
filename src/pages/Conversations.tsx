
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Search, 
  Filter,
  Plus,
  Archive,
  MoreVertical,
  Wifi,
  WifiOff
} from 'lucide-react';
import ConversationsList from '@/components/conversations/ConversationsList';
import MessageThread from '@/components/conversations/MessageThread';
import ConversationFilters from '@/components/conversations/ConversationFilters';
import NewConversationDialog from '@/components/conversations/NewConversationDialog';
import { useConversations } from '@/hooks/useConversations';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const { conversations, loading, unreadCount } = useConversations();
  const { isConnected } = useRealtimeConversations();

  const conversationTypes = [
    { id: 'all', label: 'All', icon: MessageCircle, count: conversations?.length || 0 },
    { id: 'email', label: 'Email', icon: Mail, count: conversations?.filter(c => c.type === 'email').length || 0 },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone, count: conversations?.filter(c => c.type === 'whatsapp').length || 0 },
    { id: 'internal_chat', label: 'Internal', icon: MessageCircle, count: conversations?.filter(c => c.type === 'internal_chat').length || 0 },
    { id: 'form_submission', label: 'Forms', icon: FileText, count: conversations?.filter(c => c.type === 'form_submission').length || 0 },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-quikle-crystal to-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white/95 border-b border-quikle-silver/30 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-quikle-primary">Conversations</h1>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Real-time connected" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" title="Real-time disconnected" />
                )}
              </div>
              <p className="text-quikle-neutral mt-1">Unified communication center</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
              <Button onClick={() => setShowNewDialog(true)} className="bg-quikle-primary hover:bg-quikle-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-quikle-silver/30 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-quikle-silver/20">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-neutral" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="grid w-full grid-cols-5">
                  {conversationTypes.map((type) => (
                    <TabsTrigger key={type.id} value={type.id} className="text-xs">
                      <type.icon className="h-3 w-3" />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <ConversationsList
                conversations={conversations}
                selectedId={selectedConversation}
                onSelect={setSelectedConversation}
                filter={activeFilter}
                searchQuery={searchQuery}
                loading={loading}
              />
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <MessageThread conversationId={selectedConversation} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-quikle-crystal/30">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-quikle-neutral mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-quikle-charcoal mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-quikle-neutral max-w-sm">
                    Choose a conversation from the sidebar to view messages and respond to customers or team members.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationDialog 
        open={showNewDialog} 
        onOpenChange={setShowNewDialog} 
      />
    </div>
  );
};

export default Conversations;
