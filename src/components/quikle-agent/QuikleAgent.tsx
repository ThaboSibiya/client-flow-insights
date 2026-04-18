import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useAgent } from './useAgent';
import ChatTab from './tabs/ChatTab';
import MeetingTab from './tabs/MeetingTab';
import UpdatesTab from './tabs/UpdatesTab';
import { cn } from '@/lib/utils';

const QuikleAgent: React.FC = () => {
  const agent = useAgent();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent.isOpen && agent.activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [agent.isOpen, agent.activeTab]);

  // Hide HelpButton while agent is open to avoid two stacked FABs.
  useEffect(() => {
    document.body.dataset.quikleAgentOpen = agent.isOpen ? 'true' : 'false';
    return () => { delete document.body.dataset.quikleAgentOpen; };
  }, [agent.isOpen]);

  const handleSend = () => {
    if (!draft.trim()) return;
    agent.sendChat(draft);
    setDraft('');
  };

  const tabs: Array<{ key: 'chat' | 'meeting' | 'updates'; label: string }> = [
    { key: 'chat', label: 'Chat' },
    { key: 'meeting', label: 'Meeting' },
    { key: 'updates', label: 'Updates' },
  ];

  return (
    <>
      {/* Floating button — minimal, single-color, stacked above HelpButton */}
      <button
        aria-label={agent.isOpen ? 'Close Quikle AI' : 'Open Quikle AI'}
        onClick={() => agent.setIsOpen(o => !o)}
        className={cn(
          'fixed right-6 z-50 flex items-center justify-center rounded-full',
          'h-11 w-11 bg-primary text-primary-foreground',
          'shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
          'border border-border/40'
        )}
        style={{ bottom: 80 }}
      >
        {agent.isOpen ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Quikle AI"
        className={cn(
          'fixed right-6 z-50 origin-bottom-right',
          'flex flex-col overflow-hidden rounded-xl',
          'bg-popover text-popover-foreground border border-border shadow-2xl',
          'transition-all duration-200'
        )}
        style={{
          bottom: 138,
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          height: 560,
          maxHeight: 'calc(100vh - 160px)',
          transform: agent.isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: agent.isOpen ? 1 : 0,
          pointerEvents: agent.isOpen ? 'auto' : 'none',
        }}
      >
        {/* Header — minimal */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Quikle AI</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => agent.setIsOpen(false)}
            aria-label="Close"
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs — segmented pill (ClickUp style) */}
        <div className="px-3 pt-3 pb-2 bg-card border-b border-border">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => agent.setActiveTab(t.key)}
                className={cn(
                  'flex-1 h-7 text-xs font-medium rounded-md transition-all',
                  agent.activeTab === t.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-background">
          {agent.activeTab === 'chat' && (
            <ChatTab
              messages={agent.messages}
              isThinking={agent.isThinking}
              onSuggestion={(t) => agent.sendChat(t)}
              onConfirm={agent.confirmAction}
              onCancel={agent.cancelAction}
            />
          )}
          {agent.activeTab === 'meeting' && (
            <MeetingTab onSave={(t, title) => agent.saveMeeting(t, title)} />
          )}
          {agent.activeTab === 'updates' && (
            <UpdatesTab onPick={agent.requestUpdate} />
          )}
        </div>

        {/* Input — only on chat */}
        {agent.activeTab === 'chat' && (
          <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask Quikle AI…"
              className="flex-1 h-9 px-3 text-sm rounded-md bg-background border border-border outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || agent.isThinking}
              aria-label="Send"
              className="h-9 w-9 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QuikleAgent;
