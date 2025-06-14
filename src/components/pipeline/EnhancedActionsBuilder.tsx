
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Mail, Webhook, Database, Settings, MessageCircle, Users } from "lucide-react";

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
      value: 'call_webhook', 
      label: 'Call Webhook', 
      icon: <Webhook className="h-4 w-4" />,
      description: 'Send data to external URL'
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
      icon: <Badge className="h-4 w-4" />,
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
      case 'assign_user':
        return { user_id: '' };
      case 'change_status':
        return { status: '' };
      case 'call_webhook':
        return { url: '', method: 'POST', headers: {}, body: '' };
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
