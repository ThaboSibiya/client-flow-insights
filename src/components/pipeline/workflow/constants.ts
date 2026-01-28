
import { NodePaletteItem, WorkflowTemplate } from './types';

export const NODE_PALETTE: NodePaletteItem[] = [
  // Triggers
  {
    type: 'trigger',
    name: 'Event Trigger',
    description: 'Start workflow on an event',
    category: 'triggers',
    icon: 'Zap'
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Receive external webhook',
    category: 'triggers',
    icon: 'Webhook'
  },
  
  // AI Actions
  {
    type: 'ai_agent',
    name: 'AI Agent',
    description: 'Autonomous AI agent with tools',
    category: 'ai_actions',
    icon: 'Bot'
  },
  {
    type: 'ai_chat',
    name: 'AI Chat',
    description: 'Send message to AI model',
    category: 'ai_actions',
    icon: 'MessageSquare'
  },
  {
    type: 'ai_classify',
    name: 'AI Classify',
    description: 'Classify text into categories',
    category: 'ai_actions',
    icon: 'Tags'
  },
  {
    type: 'ai_extract',
    name: 'AI Extract',
    description: 'Extract structured data from text',
    category: 'ai_actions',
    icon: 'FileSearch'
  },
  
  // Logic
  {
    type: 'condition',
    name: 'If/Else',
    description: 'Branch based on conditions',
    category: 'logic',
    icon: 'GitBranch'
  },
  {
    type: 'loop',
    name: 'Loop',
    description: 'Iterate over a list',
    category: 'logic',
    icon: 'RefreshCw'
  },
  {
    type: 'delay',
    name: 'Delay',
    description: 'Wait for a specified time',
    category: 'logic',
    icon: 'Clock'
  },
  {
    type: 'error_handler',
    name: 'Error Handler',
    description: 'Handle workflow errors',
    category: 'logic',
    icon: 'AlertTriangle'
  },
  
  // Integrations
  {
    type: 'email',
    name: 'Send Email',
    description: 'Send an email message',
    category: 'integrations',
    icon: 'Mail'
  },
  {
    type: 'sms',
    name: 'Send SMS',
    description: 'Send a text message',
    category: 'integrations',
    icon: 'Phone'
  },
  {
    type: 'database',
    name: 'Database',
    description: 'Read or write to database',
    category: 'integrations',
    icon: 'Database'
  },
  {
    type: 'api_call',
    name: 'API Call',
    description: 'Make HTTP request',
    category: 'integrations',
    icon: 'Globe'
  },
  
  // Actions
  {
    type: 'action',
    name: 'Custom Action',
    description: 'Perform a custom action',
    category: 'actions',
    icon: 'Play'
  },
  {
    type: 'approval',
    name: 'Approval',
    description: 'Wait for human approval',
    category: 'actions',
    icon: 'UserCheck'
  },
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'customer-welcome',
    name: 'Welcome New Customer',
    description: 'Automatically send welcome email and assign to sales rep when a new customer is added',
    category: 'customer',
    icon: 'Users',
    nodes: [
      {
        id: '1',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger',
          name: 'New Customer Added',
          category: 'triggers',
          config: { event: 'customer.created' },
        }
      },
      {
        id: '2',
        type: 'workflowNode',
        position: { x: 250, y: 150 },
        data: {
          type: 'email',
          name: 'Send Welcome Email',
          category: 'integrations',
          config: { template: 'welcome' },
        }
      },
      {
        id: '3',
        type: 'workflowNode',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          name: 'Assign to Sales Rep',
          category: 'actions',
          config: { action: 'assign_rep' },
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
  {
    id: 'ai-support-agent',
    name: 'AI Support Agent',
    description: 'Intelligent support agent that classifies tickets and responds automatically',
    category: 'ai_agent',
    icon: 'Bot',
    nodes: [
      {
        id: '1',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger',
          name: 'New Support Ticket',
          category: 'triggers',
          config: { event: 'ticket.created' },
        }
      },
      {
        id: '2',
        type: 'workflowNode',
        position: { x: 250, y: 150 },
        data: {
          type: 'ai_classify',
          name: 'Classify Ticket',
          category: 'ai_actions',
          config: { categories: ['billing', 'technical', 'general'] },
        }
      },
      {
        id: '3',
        type: 'workflowNode',
        position: { x: 250, y: 250 },
        data: {
          type: 'ai_agent',
          name: 'AI Response Agent',
          category: 'ai_actions',
          config: { persona: 'support' },
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
  {
    id: 'pipeline-automation',
    name: 'Pipeline Stage Automation',
    description: 'Automate actions when customers move between pipeline stages',
    category: 'pipeline',
    icon: 'GitBranch',
    nodes: [
      {
        id: '1',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger',
          name: 'Stage Changed',
          category: 'triggers',
          config: { event: 'pipeline.stage_changed' },
        }
      },
      {
        id: '2',
        type: 'workflowNode',
        position: { x: 250, y: 150 },
        data: {
          type: 'condition',
          name: 'Check Stage',
          category: 'logic',
          config: { field: 'stage' },
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
    ]
  },
  {
    id: 'webhook-integration',
    name: 'Webhook Integration',
    description: 'Process incoming webhooks and trigger actions',
    category: 'integration',
    icon: 'Webhook',
    nodes: [
      {
        id: '1',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          type: 'webhook',
          name: 'Receive Webhook',
          category: 'triggers',
          config: {},
        }
      },
      {
        id: '2',
        type: 'workflowNode',
        position: { x: 250, y: 150 },
        data: {
          type: 'ai_extract',
          name: 'Extract Data',
          category: 'ai_actions',
          config: {},
        }
      },
      {
        id: '3',
        type: 'workflowNode',
        position: { x: 250, y: 250 },
        data: {
          type: 'database',
          name: 'Save to Database',
          category: 'integrations',
          config: {},
        }
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  triggers: 'Triggers',
  ai_actions: 'AI Actions',
  logic: 'Logic',
  integrations: 'Integrations',
  actions: 'Actions',
};

export const CATEGORY_COLORS: Record<string, string> = {
  triggers: 'hsl(var(--chart-1))',
  ai_actions: 'hsl(var(--chart-2))',
  logic: 'hsl(var(--chart-3))',
  integrations: 'hsl(var(--chart-4))',
  actions: 'hsl(var(--chart-5))',
};
