export type AgentRole = 'user' | 'assistant';

export interface ActionResult {
  ok: boolean;
  summary: string;
  data?: unknown;
  error?: string;
}

export interface PlanStep {
  index: number;
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  status?: 'pending' | 'running' | 'done' | 'failed' | 'skipped' | 'undone';
  enabled?: boolean;     // user toggle in the edit view
  result?: ActionResult;
  error?: string;
  logId?: string;        // agent_action_log row id once created
}

export interface AgentPlan {
  planId: string;        // client-generated UUID, shared across all log rows
  title: string;
  steps: PlanStep[];
  status: 'proposed' | 'running' | 'done' | 'failed' | 'cancelled' | 'undone';
  hasWrites?: boolean;   // any step that mutated data
}

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  actionTaken?: string;
  actionResult?: ActionResult;
  meetingNotes?: {
    title?: string;
    summary?: string;
    decisions?: string[];
    action_items?: string[];
    follow_up_date?: string | null;
  };
  updateReport?: {
    entity: 'tasks' | 'leads' | 'followups';
    summary: string;
    count: number;
    items: any[];
  };
  pendingAction?: PendingAction;
  pendingResolved?: 'confirmed' | 'cancelled';
  plan?: AgentPlan;
  feedback?: 1 | -1;
  createdAt: number;
}

export interface PendingAction {
  tool: string;
  args: Record<string, unknown>;
  preview: { title: string; lines: string[] };
}

export interface ActionLogEntry {
  id: string;
  plan_id: string;
  plan_title: string | null;
  step_index: number;
  tool_name: string;
  args: any;
  result: any;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped' | 'undone';
  inverse_op: any;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export type AgentTab = 'chat' | 'meeting' | 'inbox' | 'activity';
