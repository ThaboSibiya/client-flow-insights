# Quikle AI Agent — Chatbot → Agent Upgrade Plan

Phased rollout. Each phase is independently shippable and additive to the existing
`quikle-agent` edge function + `useAgent` hook. No phase requires throwing away
prior work.

---

## Phase 1 — Foundations (chat → real assistant)
Goal: make the existing chat behave like a competent assistant before adding autonomy.

1. **Persist conversations** — new `agent_conversations` + `agent_messages` tables (workspace-scoped, RLS by `user_id` + `workspace_id`). Replace in-memory `messages` in `useAgent` with DB-backed history.
2. **Full history to the model** — send the complete thread (trimmed by token budget, not by count) on every call. Today we cap at 10.
3. **Markdown rendering** — render assistant messages via `react-markdown` with the project's `prose` styles.
4. **Streaming responses** — switch edge function to SSE; stream tokens into the message bubble.
5. **Tool registry refactor** — extract tool definitions in `quikle-agent/index.ts` into a typed registry (`tools/*.ts`), each with `name`, `description`, `schema`, `handler`, `requiresConfirmation`. Makes phases 2–4 trivial to extend.

**Files touched:** `supabase/functions/quikle-agent/`, `useAgent.ts`, new `AgentMessage.tsx` renderer.

---

## Phase 2 — Action tools (do, don't just suggest)
Goal: agent can take real CRM actions on user confirmation.

Add tools to the registry:
- `create_task({ title, due_date, customer_id?, assignee_id? })`
- `create_followup({ customer_id, date, note })`
- `update_lead_stage({ lead_id, stage_id })`
- `send_payment_reminder({ invoice_id, channel: 'email'|'sms' })` — reuses `financeApiService` send-reminder edge function
- `log_note({ entity_type, entity_id, content })`
- `schedule_meeting({ customer_id, datetime, attendees[] })`

All write tools route through `pendingAction` → user confirms in chat (already wired). Reads execute immediately.

**Permission gate:** check `useAIAgentAccess.canCreateWorkflows` server-side via the JWT before any write tool runs.

---

## Phase 3 — Proactive monitoring (the real "agent" leap)
Goal: agent initiates conversations based on what it sees in the data.

1. **Background scanner edge function** `quikle-agent-scanner`, scheduled via `pg_cron` every 15 min.
2. Scanner runs per-workspace queries for:
   - Overdue invoices (> X days, no recent reminder)
   - Stale leads (no activity > N days, stage ≠ closed)
   - Tickets approaching SLA breach
   - Follow-ups due today with no completion
   - Quotes sent > 7 days ago with no response
   - On-site jobs completed but not invoiced
3. Emits items into a new `agent_alerts` table (workspace + user scoped).
4. **Agent Inbox tab** in the Quikle agent panel — lists alerts with one-click actions ("Send reminder", "Reschedule", "Dismiss"). Each action reuses Phase 2 tools.
5. **Realtime badge** on the agent launcher when new alerts arrive (reuse `useRealtimeNotifications` pattern).

---

## Phase 4 — Daily briefings & summaries
Goal: agent volunteers context at the right moments.

1. **Login briefing** — on first chat open of the day, agent posts a generated summary: today's follow-ups, overdue items, pipeline movement since yesterday, top 3 priorities. Cached per user per day.
2. **Weekly digest** — Monday 8am edge function emails (Resend) + posts to chat: pipeline summary, revenue, churn risks, agent-completed actions.
3. **End-of-day wrap** — optional, opt-in: "Here's what changed today, and what's on tomorrow."

Uses Lovable AI Gateway (`LOVABLE_API_KEY` already set) for summarization.

---

## Phase 5 — Memory & personalization
Goal: agent learns the user and the workspace.

1. **Per-user agent memory** table (`agent_memory`): facts the agent extracts ("Sarah prefers WhatsApp follow-ups", "We never call on Fridays"). Injected into system prompt.
2. **Per-customer memory** keyed to `customer_id`: last touchpoint summary, preferred channel, tone notes. Surfaced when the user opens that customer.
3. **Feedback loop** — 👍/👎 on each assistant message writes to `agent_feedback`, used to tune retrieval and (later) fine-tune prompts.

---

## Phase 6 — Workflow authoring & scheduled prompts
Goal: agent becomes a workflow designer, not just an executor.

1. **"Create a workflow" intent** — agent uses existing `useWorkflowExecutor` + ReactFlow schema to propose and (on confirm) save a workflow into `workflow_automations`.
2. **Scheduled user prompts** — "Every Monday 8am, give me a pipeline summary" → stored in new `agent_scheduled_prompts` table, executed via cron, results posted to chat + notification.
3. **Custom triggers** — "When a deal hits R50k, ping me" → compiled into rules consumed by the scanner in Phase 3.

---

## Phase 7 — Multi-step autonomy (guarded)
Goal: agent chains actions across multiple turns without user re-prompting.

1. **Plan-and-execute loop** in the edge function: agent proposes a plan (list of tool calls), user approves the plan once, agent executes sequentially with per-step status streamed back.
2. **Hard guardrails**: max N tool calls per plan, no destructive ops (delete, bulk update) without per-step confirm, full audit log to `agent_action_log`.
3. **Rollback** — every write tool records an inverse op so the user can "undo last agent action".

---

## Cross-cutting concerns

- **Audit log** (`agent_action_log`): every tool execution, args, result, user, workspace, timestamp. Surface in Settings → AI Agent.
- **Cost tracking**: token usage per workspace, enforce against plan limits (`usePlanLimits`).
- **Privilege model**: extend `useAIAgentAccess` with `can_execute_actions`, `can_create_scheduled_prompts`, `can_access_inbox` per employee.
- **Observability**: structured logs from the edge function → existing Supabase function logs.

---

## Suggested execution order

1. Phase 1 (foundations) — required for everything else.
2. Phase 2 (action tools) — biggest perceived value jump.
3. Phase 3 (proactive scanner + inbox) — the chatbot→agent moment.
4. Phase 4 (briefings) — low effort given 1–3 are in place.
5. Phase 5 → 6 → 7 in order; each builds on prior memory and tool surface.

## Open questions before Phase 1

1. Conversation retention — keep forever, or auto-archive after N days?
2. Should the agent be workspace-shared (everyone sees the same threads) or strictly per-user?
3. For Phase 3 alerts, default delivery: in-app only, or also email/push?
