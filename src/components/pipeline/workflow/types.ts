
import { Node, Edge } from '@xyflow/react';

export type WorkflowNodeType = 
  | 'trigger' 
  | 'condition' 
  | 'loop' 
  | 'approval' 
  | 'error_handler' 
  | 'action'
  | 'ai_agent'
  | 'ai_chat'
  | 'ai_classify'
  | 'ai_extract'
  | 'delay'
  | 'webhook'
  | 'email'
  | 'sms'
  | 'database'
  | 'api_call';

export type NodeCategory = 'triggers' | 'ai_actions' | 'logic' | 'integrations' | 'actions';

export interface WorkflowNodeData {
  name: string;
  type: WorkflowNodeType;
  category: NodeCategory;
  config: Record<string, any>;
  description?: string;
  icon?: string;
  [key: string]: any;
}

export type CustomNode = Node<WorkflowNodeData>;

export interface NodePaletteItem {
  type: WorkflowNodeType;
  name: string;
  description: string;
  category: NodeCategory;
  icon: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer' | 'ai_agent' | 'pipeline' | 'integration';
  icon: string;
  nodes: CustomNode[];
  edges: Edge[];
}
