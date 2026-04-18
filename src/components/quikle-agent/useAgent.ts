import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AgentMessage, AgentTab, PendingAction } from './types';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function useAgent() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentTab>('chat');
  const [isOpen, setIsOpen] = useState(false);

  const append = useCallback((m: AgentMessage) => {
    setMessages(prev => [...prev, m]);
  }, []);

  const sendChat = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: AgentMessage = { id: uid(), role: 'user', content: trimmed, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const history = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role, content: m.content,
      }));
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'chat', message: trimmed, history: history.slice(0, -1) },
      });
      if (error) throw error;
      append({
        id: uid(),
        role: 'assistant',
        content: data?.reply ?? 'Sorry, no response.',
        actionTaken: data?.actionTaken,
        actionResult: data?.actionResult,
        pendingAction: data?.pendingAction,
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(),
        role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  }, [messages, append]);

  const confirmAction = useCallback(async (messageId: string, action: PendingAction) => {
    setIsThinking(true);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, pendingResolved: 'confirmed' } : m));
    try {
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'confirm', action },
      });
      if (error) throw error;
      append({
        id: uid(), role: 'assistant',
        content: data?.reply ?? 'Done.',
        actionTaken: data?.actionTaken,
        actionResult: data?.actionResult,
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(), role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  }, [append]);

  const cancelAction = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, pendingResolved: 'cancelled' } : m));
    append({
      id: uid(), role: 'assistant',
      content: 'Cancelled — nothing was changed.',
      createdAt: Date.now(),
    });
  }, [append]);

  const saveMeeting = useCallback(async (transcript: string, title: string) => {
    if (!transcript.trim()) return;
    setActiveTab('chat');
    setIsThinking(true);
    append({
      id: uid(), role: 'user',
      content: `Save meeting${title ? `: ${title}` : ''}`,
      createdAt: Date.now(),
    });
    try {
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'meeting', transcript, title: title || 'Untitled meeting' },
      });
      if (error) throw error;
      const n = data?.notes ?? {};
      append({
        id: uid(), role: 'assistant',
        content: 'Meeting saved.',
        meetingNotes: {
          title: n.title,
          summary: n.summary,
          decisions: n.decisions,
          action_items: n.action_items,
          follow_up_date: n.follow_up_date,
        },
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(), role: 'assistant',
        content: `Error saving meeting: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  }, [append]);

  const requestUpdate = useCallback(async (entity: 'tasks' | 'leads' | 'followups') => {
    const labels = { tasks: 'Task update', leads: 'Lead update', followups: 'Follow-up update' };
    setActiveTab('chat');
    setIsThinking(true);
    append({ id: uid(), role: 'user', content: labels[entity], createdAt: Date.now() });
    try {
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'update', entity },
      });
      if (error) throw error;
      append({
        id: uid(), role: 'assistant',
        content: data?.summary ?? 'No data.',
        updateReport: {
          entity,
          summary: data?.summary ?? '',
          count: data?.count ?? 0,
          items: data?.items ?? [],
        },
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(), role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  }, [append]);

  return {
    messages, isThinking, activeTab, setActiveTab,
    isOpen, setIsOpen,
    sendChat, saveMeeting, requestUpdate,
    confirmAction, cancelAction,
  };
}
