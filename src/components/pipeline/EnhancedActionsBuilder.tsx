
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Mail, Webhook, Database, Settings, MessageCircle, Users, FileText, Calendar, Zap, Tag } from "lucide-react";

interface Action {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  delay?: number;
}

interface EnhancedActionsBuilderProps {
  onActionsChange: (actions: Action[]) => void;
  initialActions?: Action[];
}

const EnhancedActionsBuilder = ({ onActionsChange, initialActions = [] }: EnhancedActionsBuilderProps) => {
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [selectedActionType, setSelectedActionType] = useState('');

  const actionTypes = [
    { 
      value: 'send_email', 
      label: 'Send Email', 
      icon: <Mail className="h-4 w-4" />,
      description: 'Send automated email notification'
    },
    { 
      value: 'send_sms', 
      label: 'Send SMS', 
      icon: <MessageCircle className="h-4 w-4" />,
      description: 'Send SMS notification'
    },
    { 
      value: 'update_field', 
      label: 'Update Field', 
      icon: <Database className="h-4 w-4" />,
      description: 'Update customer or ticket field'
    },
    { 
      value: 'update_custom_field', 
      label: 'Update Custom Field', 
      icon: <Settings className="h-4 w-4" />,
      description: 'Update any custom field value'
    },
    { 
      value: 'assign_user', 
      label: 'Assign to User', 
      icon: <Users className="h-4 w-4" />,
      description: 'Assign to team member'
    },
    { 
      value: 'change_status', 
      label: 'Change Status', 
      icon: <Settings className="h-4 w-4" />,
      description: 'Update status or stage'
    },
    { 
      value: 'attach_file', 
      label: 'Attach File', 
      icon: <FileText className="h-4 w-4" />,
      description: 'Automatically attach documents'
    },
    { 
      value: 'create_calendar_event', 
      label: 'Create Calendar Event', 
      icon: <Calendar className="h-4 w-4" />,
      description: 'Schedule meetings and reminders'
    },
    { 
      value: 'call_webhook', 
      label: 'Call Webhook', 
      icon: <Webhook className="h-4 w-4" />,
      description: 'Send data to external URL'
    },
    { 
      value: 'crm_integration', 
      label: 'CRM Integration', 
      icon: <Zap className="h-4 w-4" />,
      description: 'Sync with external CRM system'
    },
    { 
      value: 'email_platform_integration', 
      label: 'Email Platform Integration', 
      icon: <Mail className="h-4 w-4" />,
      description: 'Connect to external email platforms'
    },
    { 
      value: 'create_task', 
      label: 'Create Task', 
      icon: <Plus className="h-4 w-4" />,
      description: 'Create follow-up task'
    },
    { 
      value: 'add_tag', 
      label: 'Add Tag', 
      icon: <Tag className="h-4 w-4" />,
      description: 'Add tag to record'
    }
  ];

  const addAction = () => {
    if (!selectedActionType) return;

    const actionType = actionTypes.find(type => type.value === selectedActionType);
    const newAction: Action = {
      id: Date.now().toString(),
      type: selectedActionType,
      name: actionType?.label || '',
      config: getDefaultConfig(selectedActionType),
      delay: 0
    };

    const updated = [...actions, newAction];
    setActions(updated);
    onActionsChange(updated);
    setSelectedActionType('');
  };

  const removeAction = (actionId: string) => {
    const updated = actions.filter(action => action.id !== actionId);
    setActions(updated);
    onActionsChange(updated);
  };

  const updateAction = (actionId: string, updates: Partial<Action>) => {
    const updated = actions.map(action =>
      action.id === actionId ? { ...action, ...updates } : action
    );
    setActions(updated);
    onActionsChange(updated);
  };

  const updateActionConfig = (actionId: string, configKey: string, value: any) => {
    const updated = actions.map(action =>
      action.id === actionId 
        ? { ...action, config: { ...action.config, [configKey]: value } }
        : action
    );
    setActions(updated);
    onActionsChange(updated);
  };

  const getDefaultConfig = (actionType: string): Record<string, any> => {
    switch (actionType) {
      case 'send_email':
        return { template: '', recipient: '', subject: '', body: '' };
      case 'send_sms':
        return { recipient: '', message: '' };
      case 'update_field':
        return { field: '', value: '' };
      case 'update_custom_field':
        return { field_name: '', field_type: 'text', value: '', entity: 'customer' };
      case 'assign_user':
        return { user_id: '' };
      case 'change_status':
        return { status: '' };
      case 'attach_file':
        return { file_template: '', file_name: '', file_type: 'pdf', attach_to: 'customer' };
      case 'create_calendar_event':
        return { title: '', description: '', duration: 30, attendees: '', calendar_provider: 'google' };
      case 'call_webhook':
        return { url: '', method: 'POST', headers: {}, body: '' };
      case 'crm_integration':
        return { crm_platform: 'salesforce', action: 'create_contact', mapping: {} };
      case 'email_platform_integration':
        return { platform: 'mailchimp', action: 'add_to_list', list_id: '', data: {} };
      case 'create_task':
        return { title: '', description: '', due_date: '' };
      case 'add_tag':
        return { tag: '' };
      default:
        return {};
    }
  };

  const renderActionConfig = (action: Action) => {
    const { type, config } = action;

    switch (type) {
      case 'send_email':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Template</Label>
                <Select 
                  value={config.template} 
                  onValueChange={(value) => updateActionConfig(action.id, 'template', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="follow_up">Follow-up Email</SelectItem>
                    <SelectItem value="reminder">Reminder Email</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipient</Label>
                <Input
                  value={config.recipient}
                  onChange={(e) => updateActionConfig(action.id, 'recipient', e.target.value)}
                  placeholder="Email address or field..."
                />
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={config.subject}
                onChange={(e) => updateActionConfig(action.id, 'subject', e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={config.body}
                onChange={(e) => updateActionConfig(action.id, 'body', e.target.value)}
                placeholder="Email body content..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'update_custom_field':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Entity Type</Label>
                <Select 
                  value={config.entity} 
                  onValueChange={(value) => updateActionConfig(action.id, 'entity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Field Type</Label>
                <Select 
                  value={config.field_type} 
                  onValueChange={(value) => updateActionConfig(action.id, 'field_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Field Name</Label>
              <Input
                value={config.field_name}
                onChange={(e) => updateActionConfig(action.id, 'field_name', e.target.value)}
                placeholder="Custom field name..."
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={config.value}
                onChange={(e) => updateActionConfig(action.id, 'value', e.target.value)}
                placeholder="New field value..."
              />
            </div>
          </div>
        );

      case 'attach_file':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Attach To</Label>
                <Select 
                  value={config.attach_to} 
                  onValueChange={(value) => updateActionConfig(action.id, 'attach_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer Record</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>File Type</Label>
                <Select 
                  value={config.file_type} 
                  onValueChange={(value) => updateActionConfig(action.id, 'file_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="doc">Word Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>File Template</Label>
              <Select 
                value={config.file_template} 
                onValueChange={(value) => updateActionConfig(action.id, 'file_template', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract Template</SelectItem>
                  <SelectItem value="invoice">Invoice Template</SelectItem>
                  <SelectItem value="proposal">Proposal Template</SelectItem>
                  <SelectItem value="report">Report Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File Name</Label>
              <Input
                value={config.file_name}
                onChange={(e) => updateActionConfig(action.id, 'file_name', e.target.value)}
                placeholder="Generated file name..."
              />
            </div>
          </div>
        );

      case 'create_calendar_event':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Calendar Provider</Label>
                <Select 
                  value={config.calendar_provider} 
                  onValueChange={(value) => updateActionConfig(action.id, 'calendar_provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                    <SelectItem value="apple">Apple Calendar</SelectItem>
                    <SelectItem value="calendly">Calendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={config.duration}
                  onChange={(e) => updateActionConfig(action.id, 'duration', parseInt(e.target.value))}
                  placeholder="30"
                />
              </div>
            </div>
            <div>
              <Label>Event Title</Label>
              <Input
                value={config.title}
                onChange={(e) => updateActionConfig(action.id, 'title', e.target.value)}
                placeholder="Meeting title..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={config.description}
                onChange={(e) => updateActionConfig(action.id, 'description', e.target.value)}
                placeholder="Meeting description..."
                rows={2}
              />
            </div>
            <div>
              <Label>Attendees</Label>
              <Input
                value={config.attendees}
                onChange={(e) => updateActionConfig(action.id, 'attendees', e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
          </div>
        );

      case 'crm_integration':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CRM Platform</Label>
                <Select 
                  value={config.crm_platform} 
                  onValueChange={(value) => updateActionConfig(action.id, 'crm_platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                    <SelectItem value="custom">Custom CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select 
                  value={config.action} 
                  onValueChange={(value) => updateActionConfig(action.id, 'action', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_contact">Create Contact</SelectItem>
                    <SelectItem value="update_contact">Update Contact</SelectItem>
                    <SelectItem value="create_deal">Create Deal</SelectItem>
                    <SelectItem value="update_deal">Update Deal</SelectItem>
                    <SelectItem value="add_note">Add Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Field Mapping (JSON)</Label>
              <Textarea
                value={JSON.stringify(config.mapping, null, 2)}
                onChange={(e) => {
                  try {
                    const mapping = JSON.parse(e.target.value);
                    updateActionConfig(action.id, 'mapping', mapping);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"name": "customer_name", "email": "customer_email"}'
                rows={3}
              />
            </div>
          </div>
        );

      case 'email_platform_integration':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email Platform</Label>
                <Select 
                  value={config.platform} 
                  onValueChange={(value) => updateActionConfig(action.id, 'platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mailchimp">Mailchimp</SelectItem>
                    <SelectItem value="constant_contact">Constant Contact</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="campaign_monitor">Campaign Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select 
                  value={config.action} 
                  onValueChange={(value) => updateActionConfig(action.id, 'action', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_to_list">Add to List</SelectItem>
                    <SelectItem value="remove_from_list">Remove from List</SelectItem>
                    <SelectItem value="update_contact">Update Contact</SelectItem>
                    <SelectItem value="send_campaign">Send Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>List ID</Label>
              <Input
                value={config.list_id}
                onChange={(e) => updateActionConfig(action.id, 'list_id', e.target.value)}
                placeholder="Email list identifier..."
              />
            </div>
            <div>
              <Label>Additional Data (JSON)</Label>
              <Textarea
                value={JSON.stringify(config.data, null, 2)}
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    updateActionConfig(action.id, 'data', data);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"tags": ["customer", "active"], "merge_fields": {}}'
                rows={3}
              />
            </div>
          </div>
        );

      case 'call_webhook':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>URL</Label>
                <Input
                  value={config.url}
                  onChange={(e) => updateActionConfig(action.id, 'url', e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div>
                <Label>Method</Label>
                <Select 
                  value={config.method} 
                  onValueChange={(value) => updateActionConfig(action.id, 'method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Request Body (JSON)</Label>
              <Textarea
                value={config.body}
                onChange={(e) => updateActionConfig(action.id, 'body', e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
              />
            </div>
          </div>
        );

      case 'update_field':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Field</Label>
              <Select 
                value={config.field} 
                onValueChange={(value) => updateActionConfig(action.id, 'field', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="assigned_to">Assigned To</SelectItem>
                  <SelectItem value="custom_field_1">Custom Field 1</SelectItem>
                  <SelectItem value="custom_field_2">Custom Field 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={config.value}
                onChange={(e) => updateActionConfig(action.id, 'value', e.target.value)}
                placeholder="New value..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label>Configuration</Label>
            <Input
              value={config.value || ''}
              onChange={(e) => updateActionConfig(action.id, 'value', e.target.value)}
              placeholder="Action value..."
            />
          </div>
        );
    }
  };

  const getActionIcon = (type: string) => {
    return actionTypes.find(actionType => actionType.value === type)?.icon;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={selectedActionType} onValueChange={setSelectedActionType}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose action type..." />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((actionType) => (
              <SelectItem key={actionType.value} value={actionType.value}>
                <div className="flex items-center gap-2">
                  {actionType.icon}
                  <div>
                    <div className="font-medium">{actionType.label}</div>
                    <div className="text-xs text-muted-foreground">{actionType.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addAction} disabled={!selectedActionType}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card key={action.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionIcon(action.type)}
                  <CardTitle className="text-sm">{action.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Step {index + 1}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeAction(action.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderActionConfig(action)}
              
              <div>
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  value={action.delay || 0}
                  onChange={(e) => updateAction(action.id, { delay: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No actions configured</p>
          <p className="text-xs">Add actions to define what happens when the automation triggers</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedActionsBuilder;
