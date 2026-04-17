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
  createdAt: number;
}

export type AgentTab = 'chat' | 'meeting' | 'updates';
