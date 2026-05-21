import { useState, useCallback } from 'react';
import { Edge } from '@xyflow/react';
import { CustomNode } from '@/components/pipeline/workflow/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeExecutionResult {
  nodeId: string;
  status: NodeExecutionStatus;
  output?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

export interface ExecutionState {
  isRunning: boolean;
  currentNodeId: string | null;
  results: Record<string, NodeExecutionResult>;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  timestamp: number;
  nodeId: string;
  nodeName: string;
  message: string;
  level: 'info' | 'success' | 'error' | 'warn';
}

const getTopologicalOrder = (nodes: CustomNode[], edges: Edge[]): CustomNode[] => {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => {
    adjacency.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const ordered: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);
    adjacency.get(current)?.forEach((neighbor) => {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    });
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return ordered.map((id) => nodeMap.get(id)!).filter(Boolean);
};

/** Execute a single node's action. Returns output data. */
const executeNodeAction = async (
  node: CustomNode,
  context: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const { type, config } = node.data;

  switch (type) {
    case 'trigger':
    case 'webhook':
      return { triggered: true, event: config.event || 'manual', payload: context };

    case 'condition': {
      const fieldValue = String(context[config.field] ?? '');
      const compareValue = String(config.value ?? '');
      let result = false;
      switch (config.operator) {
        case 'equals': result = fieldValue === compareValue; break;
        case 'not_equals': result = fieldValue !== compareValue; break;
        case 'contains': result = fieldValue.includes(compareValue); break;
        case 'greater_than': result = Number(fieldValue) > Number(compareValue); break;
        case 'less_than': result = Number(fieldValue) < Number(compareValue); break;
        default: result = fieldValue === compareValue;
      }
      return { conditionMet: result, field: config.field, value: fieldValue };
    }

    case 'delay': {
      const duration = Number(config.duration || 1);
      const unit = config.unit || 'seconds';
      const msMap: Record<string, number> = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };
      // In test mode, cap at 2 seconds
      const waitMs = Math.min(duration * (msMap[unit] || 1000), 2000);
      await new Promise((r) => setTimeout(r, waitMs));
      return { delayed: true, requestedMs: duration * (msMap[unit] || 1000), actualMs: waitMs };
    }

    case 'email':
      // Log email action to email_history if customer context available
      return {
        sent: true,
        to: config.to || 'recipient@example.com',
        subject: config.subject || 'No subject',
        simulated: true,
      };

    case 'sms':
      return { sent: true, to: config.to || 'N/A', simulated: true };

    case 'database': {
      const operation = config.operation || 'read';
      const table = config.table || 'customers';
      // Whitelist of tables that workflows are allowed to read.
      const ALLOWED_TABLES = new Set(['customers', 'tickets', 'invoices', 'payments', 'projects', 'conversations']);
      if (!ALLOWED_TABLES.has(table)) {
        throw new Error(`Table "${table}" is not permitted in workflows`);
      }
      if (operation === 'read') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let q: any = supabase.from(table as any).select('*').limit(5);
        // Defense-in-depth: scope to caller. RLS still enforces final access.
        q = q.eq('user_id', user.id);
        const workspaceId = (context.workspace_id as string | undefined) ?? undefined;
        if (workspaceId) q = q.eq('workspace_id', workspaceId);

        const { data, error } = await q;
        if (error) throw new Error(`DB read failed: ${error.message}`);
        return { operation: 'read', table, rowCount: data?.length ?? 0, data };
      }
      return { operation, table, simulated: true };
    }

    case 'api_call': {
      const url = config.url || config.endpoint;
      const method = (config.method || 'GET').toUpperCase();
      if (url) {
        try {
          const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
          const body = await res.text();
          return { status: res.status, ok: res.ok, body: body.substring(0, 500) };
        } catch (err: any) {
          return { error: err.message, simulated: false };
        }
      }
      return { simulated: true, method, url: url || 'not configured' };
    }

    case 'ai_agent':
    case 'ai_chat':
    case 'ai_classify':
    case 'ai_extract':
      return {
        type,
        simulated: true,
        message: `AI ${type.replace('ai_', '')} action would execute here with persona: ${config.persona || 'default'}`,
      };

    case 'loop': {
      const collection = config.collection || 'items';
      return { loopOver: collection, itemVar: config.itemVar || 'item', simulated: true };
    }

    case 'error_handler':
      return { errorHandlerActive: true, strategy: config.strategy || 'retry' };

    case 'approval':
      return { approvalRequired: true, approver: config.approver || 'admin', simulated: true };

    case 'action':
    default:
      return { executed: true, type, simulated: true };
  }
};

export const useWorkflowExecutor = () => {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isRunning: false,
    currentNodeId: null,
    results: {},
    logs: [],
  });

  const addLog = useCallback((nodeId: string, nodeName: string, message: string, level: ExecutionLog['level']) => {
    setExecutionState((prev) => ({
      ...prev,
      logs: [...prev.logs, { timestamp: Date.now(), nodeId, nodeName, message, level }],
    }));
  }, []);

  const setNodeStatus = useCallback((nodeId: string, status: NodeExecutionStatus, output?: Record<string, unknown>, error?: string, durationMs?: number) => {
    setExecutionState((prev) => ({
      ...prev,
      currentNodeId: status === 'running' ? nodeId : prev.currentNodeId,
      results: {
        ...prev.results,
        [nodeId]: { nodeId, status, output, error, durationMs },
      },
    }));
  }, []);

  const execute = useCallback(async (nodes: CustomNode[], edges: Edge[]) => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first');
      return;
    }

    setExecutionState({ isRunning: true, currentNodeId: null, results: {}, logs: [] });

    const orderedNodes = getTopologicalOrder(nodes, edges);
    const context: Record<string, unknown> = {};
    let hasError = false;

    toast.info(`Executing ${orderedNodes.length} nodes...`);

    for (const node of orderedNodes) {
      if (hasError && node.data.type !== 'error_handler') {
        setNodeStatus(node.id, 'skipped');
        addLog(node.id, node.data.name, 'Skipped due to previous error', 'warn');
        continue;
      }

      setNodeStatus(node.id, 'running');
      addLog(node.id, node.data.name, `Executing ${node.data.type}...`, 'info');

      const startTime = Date.now();

      try {
        // Small visual delay so user can see the running state
        await new Promise((r) => setTimeout(r, 400));
        const output = await executeNodeAction(node, context);
        const durationMs = Date.now() - startTime;

        // Merge output into context for downstream nodes
        Object.assign(context, output);

        setNodeStatus(node.id, 'success', output, undefined, durationMs);
        addLog(node.id, node.data.name, `Completed in ${durationMs}ms`, 'success');
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        setNodeStatus(node.id, 'error', undefined, err.message, durationMs);
        addLog(node.id, node.data.name, `Error: ${err.message}`, 'error');
        hasError = true;
      }
    }

    setExecutionState((prev) => ({ ...prev, isRunning: false, currentNodeId: null }));

    if (hasError) {
      toast.error('Workflow completed with errors');
    } else {
      toast.success('Workflow executed successfully!');
    }
  }, [addLog, setNodeStatus]);

  const reset = useCallback(() => {
    setExecutionState({ isRunning: false, currentNodeId: null, results: {}, logs: [] });
  }, []);

  return { executionState, execute, reset };
};
