
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Action {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  delay?: number;
}

interface ActionConfigFormProps {
  action: Action;
  updateActionConfig: (actionId: string, configKey: string, value: any) => void;
}

const ActionConfigForm = ({ action, updateActionConfig }: ActionConfigFormProps) => {
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

export default ActionConfigForm;
