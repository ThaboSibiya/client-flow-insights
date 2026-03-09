import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ConversationHeader from './ConversationHeader';
import ConversationFilterChips, { ConversationType } from './ConversationFilterChips';
import ConversationList from './ConversationList';
import ConversationEmptyState from './ConversationEmptyState';
import NewConversationSlideOver from './NewConversationSlideOver';
import MessageThread from '../MessageThread';
import { useConversationsOptimized } from '@/hooks/useConversationsOptimized';
import { useRealtimeConversations } from '@/hooks/useRealtimeConversations';
import { useConversationManagement } from '@/hooks/useConversationManagement';
import { useReadStatus } from '@/hooks/useReadStatus';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConversationsLayout = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);

  const {
    conversations,
    loading,
    unreadCount,
    filters,
    updateFilter,
    refreshConversations
  } = useConversationsOptimized();
  
  useRealtimeConversations();

  const { archiveConversation } = useConversationManagement();
  const { markAllAsRead } = useReadStatus();

  // P4: Wire hover actions
  const handleArchive = useCallback((id: string) => {
    archiveConversation(id);
    if (selectedConversation === id) {
      setSelectedConversation(null);
      setIsMobileThreadOpen(false);
    }
  }, [archiveConversation, selectedConversation]);

  const handlePin = useCallback((_id: string) => {
    // Pin functionality — future enhancement (no DB column yet)
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    markAllAsRead(id);
  }, [markAllAsRead]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversation(id);
    setIsMobileThreadOpen(true);
  }, []);

  const handleMobileBack = useCallback(() => {
    setIsMobileThreadOpen(false);
    setSelectedConversation(null);
  }, []);

  const counts = useMemo(() => ({
    all: conversations?.length || 0,
    email: conversations?.filter(c => c.type === 'email').length || 0,
    whatsapp: conversations?.filter(c => c.type === 'whatsapp').length || 0,
    telegram: conversations?.filter(c => c.type === 'telegram').length || 0,
    internal_chat: conversations?.filter(c => c.type === 'internal_chat').length || 0,
    form_submission: conversations?.filter(c => c.type === 'form_submission').length || 0,
    unread: unreadCount,
  }), [conversations, unreadCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedConversation) {
        setSelectedConversation(null);
        setIsMobileThreadOpen(false);
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowNewConversation(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedConversation]);

  return (
    <div className="h-full flex flex-col bg-background">
      <ConversationHeader
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => updateFilter('searchQuery', query)}
        unreadCount={unreadCount}
        onNewConversation={() => setShowNewConversation(true)}
      />

      <ConversationFilterChips
        activeFilter={filters.type as ConversationType}
        onFilterChange={(filter) => updateFilter('type', filter)}
        counts={counts}
      />

      <div className="flex-1 overflow-hidden">
        {/* Desktop: Resizable Panels */}
        <div className="hidden md:block h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel 
              defaultSize={35} 
              minSize={25} 
              maxSize={50}
              className="bg-card/30"
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation}
                onSelect={handleSelectConversation}
                loading={loading}
                onArchive={handleArchive}
                onPin={handlePin}
                onMarkRead={handleMarkRead}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors" />

            <ResizablePanel defaultSize={65} minSize={40}>
              {selectedConversation ? (
                <MessageThread conversationId={selectedConversation} />
              ) : (
                <ConversationEmptyState
                  hasConversations={(conversations?.length || 0) > 0}
                  onNewConversation={() => setShowNewConversation(true)}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Stacked Views */}
        <div className="md:hidden h-full">
          {isMobileThreadOpen && selectedConversation ? (
            <div className="h-full flex flex-col">
              <div className="px-3 py-2 border-b border-border/50 bg-card/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 -ml-2"
                  onClick={handleMobileBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MessageThread 
                  conversationId={selectedConversation} 
                  onBack={handleMobileBack}
                />
              </div>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation}
              onSelect={handleSelectConversation}
              loading={loading}
              onArchive={handleArchive}
              onPin={handlePin}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>
      </div>

      <NewConversationSlideOver
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onSuccess={refreshConversations}
      />
    </div>
  );
};

export default ConversationsLayout;
