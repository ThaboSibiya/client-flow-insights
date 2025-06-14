
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Webhook, Database, Settings, MessageCircle, Users, FileText, Calendar, Zap, Tag, Plus } from "lucide-react";
import ActionConfigForm from './ActionConfigForm';
import AdvancedActionConfigForm from './AdvancedActionConfigForm';
import IntegrationActionConfigForm from './IntegrationActionConfigForm';

interface Action {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  delay?: number;
}

interface ActionCardProps {
  action: Action;
  index: number;
  onRemove: (actionId: string) => void;
  onUpdate: (actionId: string, updates: Partial<Action>) => void;
  onUpdateConfig: (actionId: string, configKey: string, value: any) => void;
}

const ActionCard = ({ action, index, onRemove, onUpdate, onUpdateConfig }: ActionCardProps) => {
  const getActionIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      send_email: <Mail className="h-4 w-4" />,
      send_sms: <MessageCircle className="h-4 w-4" />,
      update_field: <Database className="h-4 w-4" />,
      update_custom_field: <Settings className="h-4 w-4" />,
      assign_user: <Users className="h-4 w-4" />,
      change_status: <Settings className="h-4 w-4" />,
      attach_file: <FileText className="h-4 w-4" />,
      create_calendar_event: <Calendar className="h-4 w-4" />,
      call_webhook: <Webhook className="h-4 w-4" />,
      crm_integration: <Zap className="h-4 w-4" />,
      email_platform_integration: <Mail className="h-4 w-4" />,
      create_task: <Plus className="h-4 w-4" />,
      add_tag: <Tag className="h-4 w-4" />,
    };
    return iconMap[type] || <Settings className="h-4 w-4" />;
  };

  const renderActionConfig = () => {
    const advancedTypes = ['update_custom_field', 'attach_file', 'create_calendar_event'];
    const integrationTypes = ['crm_integration', 'email_platform_integration', 'call_webhook'];
    
    if (advancedTypes.includes(action.type)) {
      return <AdvancedActionConfigForm action={action} updateActionConfig={onUpdateConfig} />;
    }
    
    if (integrationTypes.includes(action.type)) {
      return <IntegrationActionConfigForm action={action} updateActionConfig={onUpdateConfig} />;
    }
    
    return <ActionConfigForm action={action} updateActionConfig={onUpdateConfig} />;
  };

  return (
    <Card>
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
            onClick={() => onRemove(action.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {renderActionConfig()}
        
        <div>
          <Label>Delay (seconds)</Label>
          <Input
            type="number"
            value={action.delay || 0}
            onChange={(e) => onUpdate(action.id, { delay: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
