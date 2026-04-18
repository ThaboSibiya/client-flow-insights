export type AgentRole = 'user' | 'assistant';

export interface ActionResult {
  ok: boolean;
  summary: string;
  data?: unknown;
  error?: string;
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
  createdAt: number;
}

export interface PendingAction {
  tool: string;
  args: Record<string, unknown>;
  preview: { title: string; lines: string[] };
}

export type AgentTab = 'chat' | 'meeting' | 'updates';
