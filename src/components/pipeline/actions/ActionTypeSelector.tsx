
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Webhook, Database, Settings, MessageCircle, Users, FileText, Calendar, Zap, Tag } from "lucide-react";

interface ActionTypeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ActionTypeSelectorProps {
  selectedActionType: string;
  onActionTypeChange: (type: string) => void;
  onAddAction: () => void;
}

const ActionTypeSelector = ({ selectedActionType, onActionTypeChange, onAddAction }: ActionTypeSelectorProps) => {
  const actionTypes: ActionTypeOption[] = [
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

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedActionType} onValueChange={onActionTypeChange}>
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
      <Button onClick={onAddAction} disabled={!selectedActionType}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ActionTypeSelector;
