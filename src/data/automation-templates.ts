
import { UserPlus, Timer, AlertTriangle, LucideIcon, Mail, Phone, Calendar, DollarSign, Star, Users, Clock, Target, TrendingUp, MessageSquare, CheckCircle, XCircle, FileText, Bell, Repeat, Archive } from 'lucide-react';

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
    workflow?: {
      nodes: any[];
      edges: any[];
    };
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
      workflow: { nodes: [], edges: [] },
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
      workflow: { nodes: [], edges: [] },
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
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'birthday-greetings',
    name: 'Birthday Greetings',
    description: 'Send personalized birthday wishes to customers on their special day.',
    icon: Star,
    config: {
      automationName: 'Birthday Greetings',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Customer birthday today',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: '🎉 Happy Birthday {{customer.name}}!',
            templateId: 'birthday-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'quote-follow-up',
    name: 'Quote Follow-up Sequence',
    description: 'Automatically follow up on quotes that haven\'t received a response.',
    icon: DollarSign,
    config: {
      automationName: 'Quote Follow-up Sequence',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Quote sent without response for 3 days',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: 'Following up on your quote #{{quote.id}}',
            templateId: 'quote-followup-template'
          }
        },
        {
          id: 'action-2',
          type: 'create_task',
          config: {
            title: 'Call {{customer.name}} about quote',
            assignee: '{{customer.owner}}',
            dueDate: 'tomorrow'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'meeting-reminder',
    name: 'Meeting Reminder',
    description: 'Send reminders to customers before scheduled meetings.',
    icon: Calendar,
    config: {
      automationName: 'Meeting Reminder',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Meeting scheduled tomorrow',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: 'Reminder: Meeting tomorrow at {{meeting.time}}',
            templateId: 'meeting-reminder-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'ticket-auto-close',
    name: 'Auto-close Resolved Tickets',
    description: 'Automatically close tickets that have been marked as resolved for 7 days.',
    icon: CheckCircle,
    config: {
      automationName: 'Auto-close Resolved Tickets',
      automationType: 'ticket',
      triggerType: 'simple',
      simpleTrigger: 'Ticket resolved for 7 days',
      actions: [
        {
          id: 'action-1',
          type: 'update_ticket',
          config: {
            status: 'closed',
            closedReason: 'Auto-closed after resolution'
          }
        },
        {
          id: 'action-2',
          type: 'send_email',
          config: {
            to: '{{ticket.customer.email}}',
            subject: 'Ticket #{{ticket.id}} has been closed',
            templateId: 'ticket-closed-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'high-value-customer-alert',
    name: 'High-Value Customer Alert',
    description: 'Notify sales manager when a high-value customer enters the pipeline.',
    icon: TrendingUp,
    config: {
      automationName: 'High-Value Customer Alert',
      automationType: 'customer',
      triggerType: 'advanced',
      simpleTrigger: '',
      conditionGroups: [
        {
          id: 'group-1',
          operator: 'AND',
          conditions: [
            { id: 'cond-1', field: 'customer_value', operator: 'greater_than', value: '50000' }
          ]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'send_notification',
          config: {
            to: '{{sales_manager.email}}',
            message: 'High-value customer {{customer.name}} (${{customer.value}}) entered pipeline'
          }
        },
        {
          id: 'action-2',
          type: 'assign_to_senior',
          config: {
            assignTo: '{{senior_sales_rep.id}}'
          }
        }
      ],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'payment-overdue-reminder',
    name: 'Payment Overdue Reminder',
    description: 'Send payment reminders to customers with overdue invoices.',
    icon: Bell,
    config: {
      automationName: 'Payment Overdue Reminder',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Invoice overdue by 7 days',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: 'Payment Reminder - Invoice #{{invoice.id}}',
            templateId: 'payment-reminder-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'customer-satisfaction-survey',
    name: 'Customer Satisfaction Survey',
    description: 'Send satisfaction surveys after ticket resolution.',
    icon: MessageSquare,
    config: {
      automationName: 'Customer Satisfaction Survey',
      automationType: 'ticket',
      triggerType: 'simple',
      simpleTrigger: 'Ticket status changed to resolved',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{ticket.customer.email}}',
            subject: 'How was your support experience?',
            templateId: 'satisfaction-survey-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'lead-nurturing-sequence',
    name: 'Lead Nurturing Sequence',
    description: 'Drip campaign for leads that haven\'t converted after initial contact.',
    icon: Repeat,
    config: {
      automationName: 'Lead Nurturing Sequence',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Lead in "Contacted" stage for 14 days',
      actions: [
        {
          id: 'action-1',
          type: 'send_email_sequence',
          config: {
            to: '{{customer.email}}',
            sequenceId: 'lead-nurturing-sequence',
            delay: '3 days between emails'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'contract-renewal-reminder',
    name: 'Contract Renewal Reminder',
    description: 'Remind customers about upcoming contract renewals.',
    icon: FileText,
    config: {
      automationName: 'Contract Renewal Reminder',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Contract expires in 30 days',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: 'Your contract renewal is coming up',
            templateId: 'contract-renewal-template'
          }
        },
        {
          id: 'action-2',
          type: 'create_task',
          config: {
            title: 'Discuss renewal with {{customer.name}}',
            assignee: '{{customer.account_manager}}',
            dueDate: 'in 7 days'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'inactive-customer-reactivation',
    name: 'Inactive Customer Reactivation',
    description: 'Re-engage customers who haven\'t interacted in a while.',
    icon: Target,
    config: {
      automationName: 'Inactive Customer Reactivation',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Customer inactive for 90 days',
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          config: {
            to: '{{customer.email}}',
            subject: 'We miss you! Here\'s what\'s new',
            templateId: 'reactivation-template'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'team-workload-alert',
    name: 'Team Workload Alert',
    description: 'Alert managers when team members have too many open tickets.',
    icon: Users,
    config: {
      automationName: 'Team Workload Alert',
      automationType: 'ticket',
      triggerType: 'advanced',
      simpleTrigger: '',
      conditionGroups: [
        {
          id: 'group-1',
          operator: 'AND',
          conditions: [
            { id: 'cond-1', field: 'assigned_tickets_count', operator: 'greater_than', value: '15' }
          ]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'send_notification',
          config: {
            to: '{{team_manager.email}}',
            message: '{{employee.name}} has {{ticket_count}} open tickets - consider redistribution'
          }
        }
      ],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'lost-deal-analysis',
    name: 'Lost Deal Analysis',
    description: 'Gather feedback when a deal is marked as "Closed Lost".',
    icon: XCircle,
    config: {
      automationName: 'Lost Deal Analysis',
      automationType: 'customer',
      triggerType: 'simple',
      simpleTrigger: 'Customer moved to "Closed Lost"',
      actions: [
        {
          id: 'action-1',
          type: 'create_task',
          config: {
            title: 'Conduct lost deal analysis for {{customer.name}}',
            assignee: '{{customer.owner}}',
            dueDate: 'today'
          }
        },
        {
          id: 'action-2',
          type: 'send_internal_email',
          config: {
            to: '{{sales_manager.email}}',
            subject: 'Lost Deal: {{customer.name}} - ${{deal.value}}',
            templateId: 'lost-deal-notification'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  },
  {
    id: 'archive-old-tickets',
    name: 'Archive Old Tickets',
    description: 'Automatically archive tickets that have been closed for 6 months.',
    icon: Archive,
    config: {
      automationName: 'Archive Old Tickets',
      automationType: 'ticket',
      triggerType: 'simple',
      simpleTrigger: 'Ticket closed for 180 days',
      actions: [
        {
          id: 'action-1',
          type: 'archive_ticket',
          config: {
            status: 'archived',
            reason: 'Auto-archived after 6 months'
          }
        }
      ],
      conditionGroups: [],
      workflow: { nodes: [], edges: [] },
    }
  }
];
