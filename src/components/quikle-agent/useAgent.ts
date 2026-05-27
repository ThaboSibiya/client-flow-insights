import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { getClientTime, localDateFromIso } from './clientTime';
import type { AgentMessage, AgentPlan, AgentTab, PendingAction, PlanStep } from './types';

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
  const briefingCheckedRef = useRef(false);
  // Monotonic request id — bumped on stop()/clearConversation() to ignore stale replies.
  const requestIdRef = useRef(0);

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
        .select('id, last_message_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const today = getClientTime().localDate;
      let convoId = existing?.id ?? null;
      const lastIso = (existing as any)?.last_message_at as string | null | undefined;
      // Morning reset: if the most recent convo is from a previous local day,
      // start a fresh thread so the morning briefing posts cleanly.
      const isStale = !!lastIso && localDateFromIso(lastIso) < today;

      if (!convoId || isStale) {
        const { data: created } = await supabase
          .from('agent_conversations')
          .insert({ user_id: user.id, workspace_id: workspaceId ?? null })
          .select('id')
          .single();
        convoId = created?.id ?? convoId;
      }
      if (!convoId) return;
      setConversationId(convoId);

      if (!isStale) {
        const { data: rows } = await supabase
          .from('agent_messages')
          .select('*')
          .eq('conversation_id', convoId)
          .order('created_at', { ascending: true });
        if (rows?.length) setMessages(rows.map(rowToMessage));
      }
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

  // Stop any in-flight LLM request. Bumps requestIdRef so stale replies are dropped,
  // and clears the thinking indicator immediately for snappy UX.
  const stop = useCallback(() => {
    requestIdRef.current += 1;
    setIsThinking(false);
  }, []);

  const sendChat = useCallback(async (text: string, opts?: { voice?: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: AgentMessage = { id: uid(), role: 'user', content: trimmed, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    void persist(userMsg);
    setIsThinking(true);
    const myReq = ++requestIdRef.current;

    try {
      const fullHistory = [...messages, userMsg];
      const history = trimHistoryForModel(fullHistory.slice(0, -1));
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'chat', message: trimmed, history, voice: !!opts?.voice, clientTime: getClientTime() },
      });
      if (myReq !== requestIdRef.current) return; // stopped/cleared mid-flight
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
      if (myReq !== requestIdRef.current) return;
      append({
        id: uid(),
        role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      if (myReq === requestIdRef.current) setIsThinking(false);
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

  // ─── Daily login briefing ───────────────────────────────────────────
  // First time the panel opens each day, fetch (or generate) today's briefing
  // and post it as an assistant message. Cached per user per day server-side,
  // and we skip if today's briefing has already been posted to chat.
  useEffect(() => {
    if (!isOpen || briefingCheckedRef.current) return;
    if (!conversationId || !userIdRef.current) return;
    briefingCheckedRef.current = true;

    (async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        // Skip if a briefing was already posted to chat today.
        const { data: existing } = await supabase
          .from('agent_daily_briefings')
          .select('id, posted_to_chat')
          .eq('user_id', userIdRef.current!)
          .eq('briefing_date', today)
          .maybeSingle();
        if (existing?.posted_to_chat) return;

        const { data, error } = await supabase.functions.invoke('quikle-agent-briefing', {
          body: {},
        });
        if (error) throw error;
        if (!data?.summary) return;

        append({
          id: uid(),
          role: 'assistant',
          content: data.summary,
          createdAt: Date.now(),
        });

        if (data.briefing_id) {
          await supabase
            .from('agent_daily_briefings')
            .update({ posted_to_chat: true })
            .eq('id', data.briefing_id);
        }
      } catch (e) {
        console.warn('[useAgent] briefing failed:', e);
      }
    })();
  }, [isOpen, conversationId, append]);


  const sendFeedback = useCallback(async (messageId: string, rating: 1 | -1, comment?: string) => {
    try {
      await supabase.functions.invoke('quikle-agent', {
        body: { type: 'feedback', messageId, rating, comment: comment ?? null },
      });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: rating } : m));
    } catch (e) {
      console.warn('[useAgent] feedback failed:', e);
    }
  }, []);

  // ─── Phase 7: multi-step plans ───────────────────────────────────────
  // Map of write-tools → the DB table their resulting row lives in.
  // Used to record inverse_op so the undo edge function can delete it.
  const TOOL_TO_TABLE: Record<string, string> = {
    create_task: 'tickets',
    create_followup: 'followups',
    create_lead: 'customers',
    create_quote: 'quotes_invoices',
    create_invoice: 'quotes_invoices',
    create_workflow: 'workflow_automations',
    create_project: 'projects',
    create_project_task: 'project_tasks',
    remember: 'agent_memory',
  };

  const updatePlan = useCallback((messageId: string, mut: (p: AgentPlan) => AgentPlan) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId && m.plan ? { ...m, plan: mut(m.plan) } : m
    ));
  }, []);

  const proposePlan = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: AgentMessage = { id: uid(), role: 'user', content: `Plan: ${trimmed}`, createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    void persist(userMsg);
    setIsThinking(true);
    try {
      const history = trimHistoryForModel(messages);
      const { data, error } = await supabase.functions.invoke('quikle-agent', {
        body: { type: 'plan', message: trimmed, history },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as any).context;
          const body = ctx && typeof ctx.json === 'function' ? await ctx.json() : null;
          if (body?.error) detail = body.error;
        } catch { /* ignore */ }
        throw new Error(detail);
      }
      const raw = data?.plan;
      if (!raw?.steps?.length) throw new Error(data?.error || 'No plan returned');
      const plan: AgentPlan = {
        planId: crypto.randomUUID(),
        title: String(raw.title || 'Plan'),
        status: 'proposed',
        steps: (raw.steps as PlanStep[]).map((s, i) => ({
          index: typeof s.index === 'number' ? s.index : i,
          tool: s.tool,
          args: s.args ?? {},
          summary: s.summary ?? s.tool,
          status: 'pending',
          enabled: true,
        })),
      };
      append({
        id: uid(),
        role: 'assistant',
        content: `Here's the plan I'd run for you. Review and approve when ready.`,
        plan,
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(),
        role: 'assistant',
        content: `Couldn't build a plan: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  }, [messages, append, persist]);

  const findMessageWithPlan = useCallback((planId: string): AgentMessage | undefined => {
    return messages.find(m => m.plan?.planId === planId);
  }, [messages]);

  const cancelPlan = useCallback((planId: string) => {
    const msg = findMessageWithPlan(planId);
    if (!msg) return;
    updatePlan(msg.id, p => ({ ...p, status: 'cancelled' }));
    append({
      id: uid(), role: 'assistant',
      content: 'Plan cancelled — nothing was changed.',
      createdAt: Date.now(),
    });
  }, [findMessageWithPlan, updatePlan, append]);

  const approvePlan = useCallback(async (planId: string, enabledIndices: number[]) => {
    const userId = userIdRef.current;
    const msg = findMessageWithPlan(planId);
    if (!msg?.plan || !userId) return;
    const enabledSet = new Set(enabledIndices);
    const steps = msg.plan.steps.map(s => ({ ...s, enabled: enabledSet.has(s.index) }));
    updatePlan(msg.id, p => ({ ...p, status: 'running', steps }));

    // Pre-insert pending log rows for the enabled steps.
    const toRun = steps.filter(s => s.enabled);
    const logRows = toRun.map(s => ({
      user_id: userId,
      workspace_id: workspaceId ?? null,
      conversation_id: conversationId,
      plan_id: planId,
      plan_title: msg.plan!.title,
      step_index: s.index,
      tool_name: s.tool,
      args: s.args as any,
      status: 'pending' as const,
    }));
    let logIdByIndex = new Map<number, string>();
    try {
      const { data: inserted } = await supabase
        .from('agent_action_log')
        .insert(logRows)
        .select('id, step_index');
      (inserted ?? []).forEach((r: any) => logIdByIndex.set(r.step_index, r.id));
    } catch (e) {
      console.warn('[useAgent] action log pre-insert failed:', e);
    }

    let hasWrites = false;
    let anyFailed = false;

    for (const step of toRun) {
      const logId = logIdByIndex.get(step.index);
      updatePlan(msg.id, p => ({
        ...p,
        steps: p.steps.map(s => s.index === step.index ? { ...s, status: 'running', logId } : s),
      }));
      if (logId) {
        await supabase.from('agent_action_log').update({
          status: 'running',
          started_at: new Date().toISOString(),
        }).eq('id', logId);
      }

      try {
        const { data, error } = await supabase.functions.invoke('quikle-agent', {
          body: { type: 'confirm', action: { tool: step.tool, args: step.args } },
        });
        if (error) throw error;
        const result = data?.actionResult ?? { ok: true, summary: data?.reply ?? 'Done.' };
        const ok = result?.ok !== false;
        const inverseTable = TOOL_TO_TABLE[step.tool];
        const createdId = (result?.data as any)?.id;
        const inverse_op = ok && inverseTable && createdId
          ? { table: inverseTable, id: createdId }
          : null;
        if (ok && inverse_op) hasWrites = true;

        updatePlan(msg.id, p => ({
          ...p,
          steps: p.steps.map(s => s.index === step.index
            ? { ...s, status: ok ? 'done' : 'failed', result, error: ok ? undefined : (result?.error || result?.summary) }
            : s),
        }));
        if (logId) {
          await supabase.from('agent_action_log').update({
            status: ok ? 'done' : 'failed',
            result: result as any,
            inverse_op: inverse_op as any,
            error_message: ok ? null : (result?.error ?? result?.summary ?? null),
            finished_at: new Date().toISOString(),
          }).eq('id', logId);
        }
        if (!ok) { anyFailed = true; break; }
      } catch (e) {
        anyFailed = true;
        const errMsg = e instanceof Error ? e.message : String(e);
        updatePlan(msg.id, p => ({
          ...p,
          steps: p.steps.map(s => s.index === step.index
            ? { ...s, status: 'failed', error: errMsg }
            : s),
        }));
        if (logId) {
          await supabase.from('agent_action_log').update({
            status: 'failed',
            error_message: errMsg,
            finished_at: new Date().toISOString(),
          }).eq('id', logId);
        }
        break;
      }
    }

    updatePlan(msg.id, p => ({
      ...p,
      status: anyFailed ? 'failed' : 'done',
      hasWrites,
    }));
    append({
      id: uid(), role: 'assistant',
      content: anyFailed
        ? `Plan halted. ${toRun.length} step${toRun.length === 1 ? '' : 's'} attempted.`
        : `All ${toRun.length} step${toRun.length === 1 ? '' : 's'} completed.${hasWrites ? ' You can undo this from the plan card.' : ''}`,
      createdAt: Date.now(),
    });
  }, [findMessageWithPlan, updatePlan, append, workspaceId, conversationId]);

  const undoPlan = useCallback(async (planId: string) => {
    const msg = findMessageWithPlan(planId);
    if (!msg) return;
    try {
      const { data, error } = await supabase.functions.invoke('quikle-agent-undo', {
        body: { plan_id: planId },
      });
      if (error) throw error;
      updatePlan(msg.id, p => ({
        ...p,
        status: 'undone',
        steps: p.steps.map(s => s.status === 'done' ? { ...s, status: 'undone' } : s),
      }));
      append({
        id: uid(), role: 'assistant',
        content: `Undid ${data?.undone ?? 0} of ${data?.total ?? 0} steps.`,
        createdAt: Date.now(),
      });
    } catch (e) {
      append({
        id: uid(), role: 'assistant',
        content: `Undo failed: ${e instanceof Error ? e.message : String(e)}`,
        createdAt: Date.now(),
      });
    }
  }, [findMessageWithPlan, updatePlan, append]);

  return {
    messages, isThinking, activeTab, setActiveTab,
    isOpen, setIsOpen,
    sendChat, saveMeeting, requestUpdate,
    confirmAction, cancelAction,
    clearConversation, sendFeedback,
    proposePlan, approvePlan, cancelPlan, undoPlan,
  };
}
