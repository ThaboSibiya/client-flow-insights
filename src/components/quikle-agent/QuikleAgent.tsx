import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Sparkles, Square, Lock, Clock, Wand2, Mic, Loader2, Volume2, VolumeX, Trash2 } from 'lucide-react';
import ScheduledPromptsSheet from './scheduled/ScheduledPromptsSheet';
import { useAgent } from './useAgent';
import ChatTab from './tabs/ChatTab';
import MeetingTab from './tabs/MeetingTab';
import InboxTab from './tabs/InboxTab';
import ActivityTab from './tabs/ActivityTab';
import { useAgentAlerts } from './useAgentAlerts';
import { useVoiceInput } from './useVoiceInput';
import { useSpeakReply } from './useSpeakReply';
import { cn } from '@/lib/utils';
import { useAIAgentAccess } from '@/hooks/useAIAgentAccess';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

const QuikleAgent: React.FC = () => {
  const agent = useAgent();
  const { canUseAgent, canCreateWorkflows, reason } = useAIAgentAccess();
  const { alerts } = useAgentAlerts();
  const [draft, setDraft] = useState('');
  const [scheduledOpen, setScheduledOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakReply = useSpeakReply();
  const lastSpokenIdRef = useRef<string | null>(null);

  const voice = useVoiceInput({
    onTranscript: (text) => {
      // Voice and text share the same brain. `voice: true` tells the edge fn
      // to keep the reply to 1–2 short sentences (snappier TTS + smaller LLM completion).
      agent.sendChat(text, { voice: true });
      // Auto-enable TTS for the upcoming reply so users actually hear it back.
      if (!speakReply.enabled) speakReply.setEnabled(true);
    },
    silenceMs: 800,
  });

  // Speak the latest assistant reply when "speak replies" is on.
  useEffect(() => {
    if (!speakReply.enabled) return;
    const last = agent.messages[agent.messages.length - 1];
    if (!last || last.role !== 'assistant' || !last.content) return;
    if (lastSpokenIdRef.current === last.id) return;
    lastSpokenIdRef.current = last.id;
    speakReply.speak(last.content);
  }, [agent.messages, speakReply]);

  // Cancel any ongoing TTS when the panel closes.
  useEffect(() => {
    if (!agent.isOpen) speakReply.cancel();
  }, [agent.isOpen, speakReply]);

  const statusPill = useMemo(() => {
    if (voice.phase === 'listening') return { label: 'Listening…', tone: 'bg-destructive/15 text-destructive' };
    if (voice.phase === 'transcribing') return { label: 'Transcribing…', tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' };
    if (agent.isThinking) return { label: 'Thinking…', tone: 'bg-primary/15 text-primary' };
    if (speakReply.enabled && window.speechSynthesis?.speaking) return { label: 'Speaking…', tone: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' };
    return null;
  }, [voice.phase, agent.isThinking, speakReply.enabled]);

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

  // Allow other parts of the app to open the agent with a prefilled prompt.
  // Usage: window.dispatchEvent(new CustomEvent('quikle-agent:open', { detail: { prompt: '...' } }))
  useEffect(() => {
    const handler = (e: Event) => {
      if (!canUseAgent) {
        toast({
          title: 'AI Agent disabled',
          description: reason ?? 'Your account does not have AI Agent access.',
          variant: 'destructive',
        });
        return;
      }
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      agent.setActiveTab('chat');
      agent.setIsOpen(true);
      if (detail?.prompt) {
        setDraft(detail.prompt);
        setTimeout(() => inputRef.current?.focus(), 260);
      }
    };
    window.addEventListener('quikle-agent:open', handler);
    return () => window.removeEventListener('quikle-agent:open', handler);
  }, [agent, canUseAgent, reason]);

  const handleSend = () => {
    if (!draft.trim()) return;
    if (!canCreateWorkflows && /workflow|automat|build|create/i.test(draft)) {
      toast({
        title: 'Workflow creation disabled',
        description: 'You can chat but cannot create workflows. Ask your admin for access.',
        variant: 'destructive',
      });
      return;
    }
    agent.sendChat(draft);
    setDraft('');
  };

  const handlePlan = () => {
    if (!draft.trim()) return;
    agent.proposePlan(draft);
    setDraft('');
  };

  const tabs: Array<{ key: 'chat' | 'meeting' | 'inbox' | 'activity'; label: string; badge?: number }> = [
    { key: 'chat', label: 'Chat' },
    { key: 'inbox', label: 'Inbox', badge: alerts.length },
    { key: 'activity', label: 'Activity' },
    { key: 'meeting', label: 'Meeting' },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      {/* Floating button — branded, gradient, soft glow */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={
              !canUseAgent
                ? 'AI Agent disabled'
                : agent.isOpen ? 'Close Quikle AI' : 'Open Quikle AI'
            }
            onClick={() => {
              if (!canUseAgent) {
                toast({
                  title: 'AI Agent disabled',
                  description: reason ?? 'Your account does not have AI Agent access.',
                  variant: 'destructive',
                });
                return;
              }
              agent.setIsOpen(o => !o);
            }}
            aria-disabled={!canUseAgent}
            className={cn(
              'fixed right-6 z-50 flex items-center justify-center rounded-full',
              'h-12 w-12 text-primary-foreground',
              'bg-gradient-to-br from-primary to-primary/70',
              'shadow-lg transition-all duration-300',
              'ring-1 ring-primary/30',
              canUseAgent
                ? 'hover:shadow-xl hover:scale-110 active:scale-95'
                : 'opacity-50 grayscale cursor-not-allowed',
              canUseAgent && !agent.isOpen && 'quikle-fab-glow'
            )}
            style={{ bottom: 80 }}
          >
            {!canUseAgent
              ? <Lock className="h-5 w-5" />
              : agent.isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            {canUseAgent && !agent.isOpen && alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background">
                {alerts.length > 9 ? '9+' : alerts.length}
              </span>
            )}
            <style>{`
              @keyframes quikle-fab-pulse {
                0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.35), 0 10px 25px -5px hsl(var(--primary) / 0.4); }
                50% { box-shadow: 0 0 0 12px hsl(var(--primary) / 0), 0 10px 25px -5px hsl(var(--primary) / 0.4); }
              }
              .quikle-fab-glow { animation: quikle-fab-pulse 2.8s ease-in-out infinite; }
              @keyframes quikle-panel-in {
                from { opacity: 0; transform: translateY(16px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              .quikle-panel-in { animation: quikle-panel-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
            `}</style>
          </button>
        </TooltipTrigger>
        {!canUseAgent && (
          <TooltipContent side="left" className="max-w-[220px] text-xs">
            {reason ?? 'Ask your administrator for AI Agent access.'}
          </TooltipContent>
        )}
      </Tooltip>

      {/* Panel */}
      {agent.isOpen && (
        <div
          role="dialog"
          aria-label="Quikle AI"
          className={cn(
            'fixed right-6 z-50 origin-bottom-right quikle-panel-in',
            'flex flex-col overflow-hidden rounded-2xl',
            'bg-popover/95 backdrop-blur-xl text-popover-foreground',
            'border border-border/60 shadow-2xl',
            'ring-1 ring-black/5 dark:ring-white/5'
          )}
          style={{
            bottom: 142,
            width: 400,
            maxWidth: 'calc(100vw - 32px)',
            height: 'min(600px, calc(100vh - 160px))',
          }}
        >
          {/* Header — gradient accent strip */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center justify-between px-4 h-14 bg-gradient-to-b from-card to-card/60 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm ring-1 ring-primary/30">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-foreground">Quikle AI</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Online · Ready to help
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {statusPill && (
                  <span className={cn('mr-1 px-2 py-0.5 rounded-full text-[10px] font-medium', statusPill.tone)}>
                    {statusPill.label}
                  </span>
                )}
                <button
                  onClick={() => speakReply.setEnabled(!speakReply.enabled)}
                  aria-label={speakReply.enabled ? 'Disable spoken replies' : 'Enable spoken replies'}
                  title={speakReply.enabled ? 'Spoken replies on' : 'Spoken replies off'}
                  className={cn(
                    'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                    speakReply.enabled
                      ? 'text-primary bg-primary/10 hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {speakReply.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setScheduledOpen(true)}
                  aria-label="Scheduled prompts"
                  title="Scheduled prompts"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Clock className="h-4 w-4" />
                </button>
                <button
                  onClick={() => agent.setIsOpen(false)}
                  aria-label="Close"
                  className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs — underline indicator (ClickUp-style) */}
          <div className="flex items-center gap-0 px-3 bg-card border-b border-border/60">
            {tabs.map(t => {
              const active = agent.activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => agent.setActiveTab(t.key)}
                  className={cn(
                    'relative flex-1 h-10 text-xs font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {t.label}
                    {!!t.badge && t.badge > 0 && (
                      <span className={cn(
                        'inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-semibold',
                        active ? 'bg-primary text-primary-foreground' : 'bg-destructive/15 text-destructive'
                      )}>
                        {t.badge > 9 ? '9+' : t.badge}
                      </span>
                    )}
                  </span>
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-background/40">
            {agent.activeTab === 'chat' && (
              <ChatTab
                messages={agent.messages}
                isThinking={agent.isThinking}
                onSuggestion={(t) => agent.sendChat(t)}
                onConfirm={agent.confirmAction}
                onCancel={agent.cancelAction}
                onFeedback={agent.sendFeedback}
                onApprovePlan={agent.approvePlan}
                onCancelPlan={agent.cancelPlan}
                onUndoPlan={agent.undoPlan}
              />
            )}
            {agent.activeTab === 'inbox' && (
              <InboxTab
                onActOnAlert={(alert) => {
                  agent.setActiveTab('chat');
                  const sa = alert.suggested_action;
                  if (!sa) return;
                  const prompt = `Please ${sa.tool.replace(/_/g, ' ')} with ${JSON.stringify(sa.args)} (re: "${alert.title}")`;
                  agent.sendChat(prompt);
                }}
              />
            )}
            {agent.activeTab === 'activity' && <ActivityTab />}
            {agent.activeTab === 'meeting' && (
              <MeetingTab onSave={(t, title) => agent.saveMeeting(t, title)} />
            )}
          </div>

          {/* Composer — only on chat */}
          {agent.activeTab === 'chat' && (
            <div className="p-3 border-t border-border/60 bg-card">
              <div className={cn(
                'flex items-center gap-2 pl-3 pr-1.5 h-11 rounded-full',
                'bg-background border border-border/60',
                'focus-within:border-primary/50',
                'transition-all'
              )}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={agent.isThinking ? 'Quikle is thinking…' : 'Ask Quikle AI anything…'}
                  disabled={agent.isThinking}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  onClick={voice.toggle}
                  disabled={agent.isThinking && voice.phase === 'idle'}
                  aria-label={voice.phase === 'listening' ? 'Stop listening' : 'Speak to Quikle'}
                  title={voice.phase === 'listening' ? 'Stop' : 'Speak'}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-full transition-all',
                    voice.phase === 'listening'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 animate-pulse'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  {voice.phase === 'transcribing'
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : voice.phase === 'listening'
                      ? <Square className="h-3 w-3 fill-current" />
                      : <Mic className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handlePlan}
                  disabled={!draft.trim() || agent.isThinking}
                  aria-label="Plan multi-step actions"
                  title="Plan multi-step actions"
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-full transition-all',
                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </button>
                {agent.isThinking ? (
                  <button
                    onClick={() => { agent.stop(); voice.cancel(); speakReply.cancel(); }}
                    aria-label="Stop"
                    title="Stop"
                    className={cn(
                      'h-8 w-8 flex items-center justify-center rounded-full transition-all',
                      'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95'
                    )}
                  >
                    <Square className="h-3 w-3 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    aria-label="Send"
                    className={cn(
                      'h-8 w-8 flex items-center justify-center rounded-full transition-all',
                      'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
                      'hover:shadow-md hover:scale-105 active:scale-95',
                      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none'
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 px-3 text-[10px] text-muted-foreground/70 text-center">
                <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[9px]">Enter</kbd> to send · mic to talk · wand to plan
              </div>
            </div>
          )}
        </div>
      )}

      <ScheduledPromptsSheet open={scheduledOpen} onOpenChange={setScheduledOpen} />
    </TooltipProvider>
  );
};

export default QuikleAgent;
