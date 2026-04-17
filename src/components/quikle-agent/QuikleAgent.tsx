import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { useAgent } from './useAgent';
import ChatTab from './tabs/ChatTab';
import MeetingTab from './tabs/MeetingTab';
import UpdatesTab from './tabs/UpdatesTab';

const QuikleAgent: React.FC = () => {
  const agent = useAgent();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent.isOpen && agent.activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [agent.isOpen, agent.activeTab]);

  const handleSend = () => {
    if (!draft.trim()) return;
    agent.sendChat(draft);
    setDraft('');
  };

  const handleSuggestion = (text: string) => {
    agent.sendChat(text);
  };

  const tabBtn = (key: 'chat' | 'meeting' | 'updates', label: string) => (
    <button
      key={key}
      onClick={() => agent.setActiveTab(key)}
      className="flex-1 py-3 text-sm font-medium transition-colors"
      style={{
        color: agent.activeTab === key ? '#ffffff' : '#64748b',
        background: agent.activeTab === key ? '#0f172a' : 'transparent',
        borderBottom: agent.activeTab === key ? '2px solid #6366f1' : '2px solid transparent',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Floating button */}
      <button
        aria-label={agent.isOpen ? 'Close Quikle AI' : 'Open Quikle AI'}
        onClick={() => agent.setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[60] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.45)',
          color: 'white', fontSize: 24, border: 'none',
        }}
      >
        {agent.isOpen ? <X size={22} /> : <Bot size={26} />}
      </button>

      {/* Panel */}
      <div
        className="fixed z-[59] origin-bottom-right"
        style={{
          right: 24, bottom: 92,
          width: 370, maxWidth: 'calc(100vw - 32px)',
          height: 580, maxHeight: 'calc(100vh - 120px)',
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: 16,
          border: '1px solid #334155',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transformOrigin: 'bottom right',
          transform: agent.isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: agent.isOpen ? 1 : 0,
          pointerEvents: agent.isOpen ? 'auto' : 'none',
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                fontSize: 20,
              }}
            >
              <Bot size={20} color="white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Quikle AI</div>
              <div className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
                ● Agent · MiniMax M2.5
              </div>
            </div>
          </div>
          <button
            onClick={() => agent.setIsOpen(false)}
            aria-label="Close"
            className="text-white/90 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
          {tabBtn('chat', 'Chat')}
          {tabBtn('meeting', 'Meeting')}
          {tabBtn('updates', 'Updates')}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {agent.activeTab === 'chat' && (
            <ChatTab
              messages={agent.messages}
              isThinking={agent.isThinking}
              onSuggestion={handleSuggestion}
            />
          )}
          {agent.activeTab === 'meeting' && (
            <MeetingTab onSave={(t, title) => agent.saveMeeting(t, title)} />
          )}
          {agent.activeTab === 'updates' && (
            <UpdatesTab onPick={agent.requestUpdate} />
          )}
        </div>

        {/* Input bar (only on chat) */}
        {agent.activeTab === 'chat' && (
          <div
            className="flex items-center gap-2 p-3"
            style={{ background: '#1e293b', borderTop: '1px solid #334155' }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask Quikle AI…"
              className="flex-1 px-3 py-2 text-sm outline-none"
              style={{
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: 10,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || agent.isThinking}
              aria-label="Send"
              className="flex items-center justify-center transition-opacity disabled:opacity-50"
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QuikleAgent;
