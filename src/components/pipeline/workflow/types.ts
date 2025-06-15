
import { Node, Edge } from '@xyflow/react';

export type WorkflowNodeType = 'condition' | 'loop' | 'approval' | 'error_handler' | 'action';

export interface WorkflowNodeData {
  name: string;
  type: WorkflowNodeType;
  config: Record<string, any>;
  [key: string]: any;
}

export type CustomNode = Node<WorkflowNodeData>;
