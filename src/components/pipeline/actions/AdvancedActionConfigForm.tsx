
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

interface AdvancedActionConfigFormProps {
  action: Action;
  updateActionConfig: (actionId: string, configKey: string, value: any) => void;
}

const AdvancedActionConfigForm = ({ action, updateActionConfig }: AdvancedActionConfigFormProps) => {
  const { type, config } = action;

  switch (type) {
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

    default:
      return null;
  }
};

export default AdvancedActionConfigForm;
