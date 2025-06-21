
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Settings } from "lucide-react";

interface AutomationSummaryProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
}

const AutomationSummary = ({
  automationName,
  automationType,
  triggerType,
  actions = [],
  conditionGroups = [],
  simpleTrigger
}: AutomationSummaryProps) => {
  
  const generateSummary = () => {
    const parts = [];
    
    // Safe trigger handling
    if (triggerType === 'simple' && simpleTrigger) {
      parts.push(`When ${simpleTrigger.toLowerCase()}`);
    } else if (triggerType === 'advanced' && conditionGroups.length > 0) {
      const conditionCount = conditionGroups.reduce((total, group) => {
        return total + (group?.conditions?.length || 0);
      }, 0);
      parts.push(`When ${conditionCount} advanced conditions are met`);
    } else {
      parts.push('When trigger conditions are met');
    }
    
    // Safe actions handling
    if (actions.length > 0) {
      const actionTypes = actions.map(action => {
        if (!action?.type) return 'unknown action';
        
        switch (action.type) {
          case 'send_email': return 'send email';
          case 'send_sms': return 'send SMS';
          case 'update_field': return 'update field';
          case 'create_task': return 'create task';
          case 'call_webhook': return 'call webhook';
          case 'assign_user': return 'assign user';
          case 'change_status': return 'change status';
          case 'add_tag': return 'add tag';
          default: return action.type.replace('_', ' ');
        }
      });
      
      if (actionTypes.length === 1) {
        parts.push(`then ${actionTypes[0]}`);
      } else if (actionTypes.length === 2) {
        parts.push(`then ${actionTypes[0]} and ${actionTypes[1]}`);
      } else {
        parts.push(`then perform ${actionTypes.length} actions`);
      }
    } else {
      parts.push('then perform configured actions');
    }
    
    return parts.join(', ') + '.';
  };

  const getTriggerCount = () => {
    if (triggerType === 'simple') {
      return simpleTrigger ? 1 : 0;
    }
    return conditionGroups.reduce((total, group) => {
      return total + (group?.conditions?.length || 0);
    }, 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Automation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={automationType === 'customer' ? 'default' : 'secondary'}>
            {automationType === 'customer' ? 'Customer' : 'Ticket'} Automation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {getTriggerCount()} {triggerType} trigger{getTriggerCount() !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">{automationName || 'Untitled Automation'}</h4>
          <p className="text-sm text-muted-foreground">
            {generateSummary()}
          </p>
        </div>

        {/* Trigger Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-1">Trigger Configuration</h5>
            <p className="text-muted-foreground">
              {triggerType === 'simple' 
                ? (simpleTrigger || 'No trigger selected')
                : `${conditionGroups.length} condition groups`
              }
            </p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">Actions to Execute</h5>
            <p className="text-muted-foreground">
              {actions.length > 0 
                ? `${actions.length} configured action${actions.length !== 1 ? 's' : ''}`
                : 'No actions configured'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSummary;
