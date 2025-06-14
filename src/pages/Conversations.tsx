
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  WifiOff,
  Settings
} from 'lucide-react';
import ConversationsList from '@/components/conversations/ConversationsList';
import MessageThread from '@/components/conversations/MessageThread';
import ConversationFiltersAdvanced from '@/components/conversations/ConversationFiltersAdvanced';
import NewConversationDialog from '@/components/conversations/NewConversationDialog';
import NotificationSettings from '@/components/conversations/NotificationSettings';
import { useConversations } from '@/hooks/useConversations';
import { useConversationFilters } from '@/hooks/useConversationFilters';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  const { conversations, loading, unreadCount } = useConversations();
  const { isConnected } = useRealtimeConversations();
  
  const {
    filters,
    sortOptions,
    updateFilter,
    updateSort,
    resetFilters,
    filterAndSortConversations,
    activeFiltersCount,
  } = useConversationFilters();

  const filteredConversations = filterAndSortConversations(conversations);

  const conversationTypes = [
    { id: 'all', label: 'All', icon: MessageCircle, count: filteredConversations?.length || 0 },
    { id: 'email', label: 'Email', icon: Mail, count: filteredConversations?.filter(c => c.type === 'email').length || 0 },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone, count: filteredConversations?.filter(c => c.type === 'whatsapp').length || 0 },
    { id: 'internal_chat', label: 'Internal', icon: MessageCircle, count: filteredConversations?.filter(c => c.type === 'internal_chat').length || 0 },
    { id: 'form_submission', label: 'Forms', icon: FileText, count: filteredConversations?.filter(c => c.type === 'form_submission').length || 0 },
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
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
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
              <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={showAdvancedFilters ? "bg-quikle-crystal" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button onClick={() => setShowNewDialog(true)} className="bg-quikle-primary hover:bg-quikle-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <ConversationFiltersAdvanced
            filters={filters}
            sortOptions={sortOptions}
            onUpdateFilter={updateFilter}
            onUpdateSort={updateSort}
            onResetFilters={resetFilters}
            activeFiltersCount={activeFiltersCount}
          />
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-quikle-silver/30 flex flex-col">
            {/* Type Tabs */}
            <div className="p-4 border-b border-quikle-silver/20">
              <Tabs value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
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
                conversations={filteredConversations}
                selectedId={selectedConversation}
                onSelect={setSelectedConversation}
                filter={filters.type}
                searchQuery={filters.searchQuery}
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
                  {filteredConversations?.length === 0 && !loading && (
                    <p className="text-quikle-neutral text-sm mt-2">
                      No conversations match your current filters.
                    </p>
                  )}
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
