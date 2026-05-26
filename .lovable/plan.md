
# Phase 7 — Multi-step autonomy (guarded)

Let the agent chain several actions from a single user request: it proposes a plan, you approve it once, it executes step-by-step with live status, and every write is logged + undoable.

## What you'll see in the UI

1. **Plan card in chat** — when the agent decides a request needs >1 action, instead of running silently it posts a numbered plan card:
   - Each step shows the tool, a plain-English summary, and the target (e.g. "Send reminder to *Acme Ltd* — Invoice INV-0421").
   - Buttons: **Approve & run**, **Edit** (uncheck steps), **Cancel**.
2. **Live execution stream** — once approved, each step ticks from `pending → running → done/failed` inline. Failures stop the chain and surface the error with a **Retry** / **Skip** option.
3. **Undo last agent action** — a small "Undo" pill appears under the final message for 60 s for any plan that performed writes. Also reachable from a new **Activity** tab in the agent sheet.
4. **Activity tab** — chronological list of every tool the agent has run for you (who, what, when, result, undo if available).

## How it works (technical)

- **New table `agent_action_log`** (workspace + user scoped, RLS):
  `id, user_id, workspace_id, conversation_id, plan_id, step_index, tool_name, args jsonb, result jsonb, status (pending|running|done|failed|undone), inverse_op jsonb, started_at, finished_at`.
- **Edge function `quikle-agent` — plan mode**:
  - New system instruction: when a request requires ≥2 writes or mixes read+write, return a structured `plan` payload (JSON) instead of executing.
  - Hard guardrails enforced server-side: max 8 steps per plan, destructive tools (`delete_*`, `bulk_*`) always require per-step confirm, plan rejected if it touches data outside the caller's workspace.
- **New edge function `quikle-agent-executor`**: receives an approved plan id, streams SSE per step, writes to `agent_action_log`, records `inverse_op` for each write (e.g. created task → `{type: 'delete_task', id}`).
- **Undo**: `quikle-agent-undo` edge function reads `inverse_op`s for a plan in reverse and applies them; marks rows `undone`.
- **No new tools** — reuses the Phase 2 tool registry (`create_task`, `create_followup`, `update_lead_stage`, `send_payment_reminder`, `log_note`, `schedule_meeting`).
- **Permission gate**: `useAIAgentAccess.canExecuteActions` checked in the executor via JWT.

## Files

**New**
- `supabase/migrations/...` — `agent_action_log` table + RLS.
- `supabase/functions/quikle-agent-executor/index.ts`
- `supabase/functions/quikle-agent-undo/index.ts`
- `src/components/quikle-agent/plan/PlanCard.tsx`
- `src/components/quikle-agent/plan/StepRow.tsx`
- `src/components/quikle-agent/tabs/ActivityTab.tsx`
- `src/components/quikle-agent/useAgentExecutor.ts`

**Edited**
- `supabase/functions/quikle-agent/index.ts` — plan-mode system prompt + return schema.
- `src/components/quikle-agent/useAgent.ts` — detect `plan` payload, render PlanCard.
- `src/components/quikle-agent/QuikleAgent.tsx` — add Activity tab.
- `src/components/quikle-agent/types.ts` — `AgentPlan`, `PlanStep`, `ActionLogEntry`.

## Deferred (not in this phase)

- Cost/token caps per plan (folded into Cross-cutting concerns later).
- Multi-user plan approvals (the requester always approves their own plans).
- Branching plans / conditional steps — keep linear for now.

## Sanity checks before shipping

- Approve a 3-step plan (create task → log note → send reminder) end-to-end.
- Reject one step in the edit view → only remaining steps execute.
- Trigger a failure mid-plan → chain halts, retry resumes from failed step.
- Click Undo → all 3 writes reversed; Activity row shows `undone`.

Reply **yes** to proceed, or tell me what to trim/expand.
