import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import type { AgentMessage, AgentTab, PendingAction } from './types';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Rough token budget: ~4 chars per token. Keep history under ~12k tokens (~48k chars)
// so the model always has room for the system prompt + the new turn.
const HISTORY_CHAR_BUDGET = 48_000;

function trimHistoryForModel(messages: AgentMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  const out: { role: 'user' | 'assistant'; content: string }[] = [];
  let total = 0;
  // Walk newest → oldest, accumulating until we hit the budget, then reverse.
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const len = m.content?.length ?? 0;
    if (total + len > HISTORY_CHAR_BUDGET && out.length > 0) break;
    out.push({ role: m.role, content: m.content });
    total += len;
  }
  return out.reverse();
}

function rowToMessage(row: any): AgentMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content ?? '',
    actionTaken: row.action_taken ?? undefined,
    actionResult: row.action_result ?? undefined,
    meetingNotes: row.meeting_notes ?? undefined,
    updateReport: row.update_report ?? undefined,
    pendingAction: row.pending_action ?? undefined,
    pendingResolved: row.pending_resolved ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export function useAgent() {
  const workspaceId = useActiveWorkspaceId();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentTab>('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const loadedRef = useRef(false);

  // ─── Load (or create) the active conversation + its messages on mount ───
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;

      // Most-recent conversation, or create one.
      const { data: existing } = await supabase
        .from('agent_conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let convoId = existing?.id ?? null;
      if (!convoId) {
        const { data: created } = await supabase
          .from('agent_conversations')
          .insert({ user_id: user.id, workspace_id: workspaceId ?? null })
          .select('id')
          .single();
        convoId = created?.id ?? null;
      }
      if (!convoId) return;
      setConversationId(convoId);

      const { data: rows } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (rows?.length) setMessages(rows.map(rowToMessage));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(async (m: AgentMessage) => {
    const userId = userIdRef.current;
    if (!userId || !conversationId) return;
    try {
      // Server generates id (UUID). The local `m.id` is kept only as a React key —
      // we don't try to mutate this row again from the client after insert.
      await supabase.from('agent_messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        role: m.role,
        content: m.content,
        action_taken: m.actionTaken ?? null,
        action_result: (m.actionResult ?? null) as any,
        meeting_notes: (m.meetingNotes ?? null) as any,
        update_report: (m.updateReport ?? null) as any,
        pending_action: (m.pendingAction ?? null) as any,
        pending_resolved: m.pendingResolved ?? null,
      });
    } catch (e) {
      console.warn('[useAgent] persist failed:', e);
    }
  }, [conversationId]);

  const append = useCallback((m: AgentMessage) => {
    setMessages(prev => [...prev, m]);
    void persist(m);
  }, [persist]);

  const updateResolution = useCallback((messageId: string, resolved: 'confirmed' | 'cancelled') => {
    // Local-only — local message ids do not map 1:1 to DB rows (server generates UUIDs).
    // Resolution state is ephemeral by design; on reload, the chat re-renders with the
    // assistant's follow-up message which carries the outcome.
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, pendingResolved: resolved } : m));
  }, []);

  const sendChat = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: AgentMessage = { id: uid(), role: 'user', content: trimmed, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    void persist(userMsg);
    setIsThinking(true);

    try {
      const fullHistory = [...messages, userMsg];
      const history = trimHistoryForModel(fullHistory.slice(0, -1));
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'chat', message: trimmed, history },
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
  }, [messages, append, persist]);

  const confirmAction = useCallback(async (messageId: string, action: PendingAction) => {
    setIsThinking(true);
    void updateResolution(messageId, 'confirmed');
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
  }, [append, updateResolution]);

  const cancelAction = useCallback((messageId: string) => {
    void updateResolution(messageId, 'cancelled');
    append({
      id: uid(), role: 'assistant',
      content: 'Cancelled — nothing was changed.',
      createdAt: Date.now(),
    });
  }, [append, updateResolution]);

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

  const clearConversation = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;
    setMessages([]);
    try {
      const { data: created } = await supabase
        .from('agent_conversations')
        .insert({ user_id: userId, workspace_id: workspaceId ?? null })
        .select('id')
        .single();
      if (created?.id) setConversationId(created.id);
    } catch (e) {
      console.warn('[useAgent] clear conversation failed:', e);
    }
  }, [workspaceId]);

  return {
    messages, isThinking, activeTab, setActiveTab,
    isOpen, setIsOpen,
    sendChat, saveMeeting, requestUpdate,
    confirmAction, cancelAction,
    clearConversation,
  };
}
