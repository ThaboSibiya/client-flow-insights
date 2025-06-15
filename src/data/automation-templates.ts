
import { UserPlus, Timer, AlertTriangle, LucideIcon } from 'lucide-react';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  config: {
    automationName: string;
    automationType: 'customer' | 'ticket';
    triggerType: 'simple' | 'advanced';
    simpleTrigger?: string;
    conditionGroups?: any[];
    actions?: any[];
    workflowNodes?: any[];
  };
}

export const automationTemplates: AutomationTemplate[] = [
  {
    id: 'welcome-new-customer',
    name: 'Welcome New Customer',
    description: 'When a new customer is added, send them a personalized welcome email.',
    icon: UserPlus,
    config: {
      automationName: 'Welcome New Customer',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Customer added to pipeline',
      actions: [
        { 
          id: 'action-1', 
          type: 'send_email', 
          config: { 
            to: '{{customer.email}}', 
            subject: 'Welcome to our family!', 
            templateId: 'welcome-template-v1' 
          }
        }
      ],
      conditionGroups: [],
      workflowNodes: [],
    }
  },
  {
    id: 'follow-up-idle-lead',
    name: 'Follow-up on Idle Lead',
    description: 'If a lead has been inactive, create a follow-up task for the assigned rep.',
    icon: Timer,
    config: {
      automationName: 'Follow-up on Idle Lead',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Customer inactive for X days',
      actions: [
        {
          id: 'action-1',
          type: 'create_task',
          config: {
            title: 'Follow up with {{customer.name}}',
            assignee: '{{customer.owner}}',
            dueDate: 'today'
          }
        }
      ],
      conditionGroups: [],
      workflowNodes: [],
    }
  },
  {
    id: 'escalate-urgent-ticket',
    name: 'Escalate Urgent Ticket',
    description: 'When a ticket is marked as "Urgent", notify the support manager.',
    icon: AlertTriangle,
    config: {
      automationName: 'Escalate Urgent Ticket',
      automationType: 'ticket',
      triggerType: 'advanced',
      simpleTrigger: '',
      conditionGroups: [
        {
          id: 'group-1',
          operator: 'AND',
          conditions: [
            { id: 'cond-1', field: 'ticket_priority', operator: 'is', value: 'Urgent' }
          ]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'send_sms',
          config: {
            to: '{{support_manager.phone}}',
            message: 'Urgent ticket #{{ticket.id}} needs attention.'
          }
        }
      ],
      workflowNodes: [],
    }
  }
];
