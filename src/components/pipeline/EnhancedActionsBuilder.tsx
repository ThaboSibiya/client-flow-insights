
import React, { useState } from 'react';
import { Settings } from "lucide-react";
import ActionTypeSelector from './actions/ActionTypeSelector';
import ActionCard from './actions/ActionCard';

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

  const actionTypeLabels: Record<string, string> = {
    send_email: 'Send Email',
    send_sms: 'Send SMS',
    update_field: 'Update Field',
    update_custom_field: 'Update Custom Field',
    assign_user: 'Assign to User',
    change_status: 'Change Status',
    attach_file: 'Attach File',
    create_calendar_event: 'Create Calendar Event',
    call_webhook: 'Call Webhook',
    crm_integration: 'CRM Integration',
    email_platform_integration: 'Email Platform Integration',
    create_task: 'Create Task',
    add_tag: 'Add Tag'
  };

  const addAction = () => {
    if (!selectedActionType) return;

    const newAction: Action = {
      id: Date.now().toString(),
      type: selectedActionType,
      name: actionTypeLabels[selectedActionType] || '',
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

  return (
    <div className="space-y-4">
      <ActionTypeSelector
        selectedActionType={selectedActionType}
        onActionTypeChange={setSelectedActionType}
        onAddAction={addAction}
      />

      <div className="space-y-3">
        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            onRemove={removeAction}
            onUpdate={updateAction}
            onUpdateConfig={updateActionConfig}
          />
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
