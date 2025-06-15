import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, Play, AlertCircle, Info } from "lucide-react";

interface PreviewProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  trigger: any;
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
}

const AutomationPreview = ({ 
  automationName, 
  automationType, 
  triggerType, 
  trigger, 
  actions,
  conditionGroups = [],
  simpleTrigger,
}: PreviewProps) => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationStep, setSimulationStep] = React.useState(0);

  const simulateExecution = async () => {
    setIsSimulating(true);
    setSimulationStep(0);
    
    // Simulate step-by-step execution
    for (let i = 0; i <= actions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSimulationStep(i);
    }
    
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationStep(0);
    }, 2000);
  };

  const generateSummary = () => {
    let triggerText = '';
    if (triggerType === 'simple' && simpleTrigger) {
        triggerText = `a ${automationType}'s ${simpleTrigger.toLowerCase()}`;
    } else if (triggerType === 'advanced' && conditionGroups.length > 0) {
        const conditionCount = conditionGroups.reduce((total, group) => total + group.conditions.length, 0);
        triggerText = `advanced conditions are met (${conditionCount} condition${conditionCount > 1 ? 's' : ''})`;
    }

    if (!triggerText) {
        return "Configure a trigger to see a summary.";
    }

    let actionsText = '';
    if (actions.length === 0) {
        actionsText = 'no actions will be performed.';
    } else if (actions.length === 1) {
        actionsText = `this automation will ${actions[0].name.toLowerCase()}.`;
    } else {
        const actionNames = actions.map(a => a.name.toLowerCase());
        const lastAction = actionNames.pop();
        actionsText = `this automation will ${actionNames.join(', ')}, and then ${lastAction}.`;
    }

    return `When ${triggerText}, ${actionsText}`;
  };

  const getTriggerSummary = () => {
    if (triggerType === 'simple') {
      return trigger || 'No trigger selected';
    }
    
    if (triggerType === 'advanced' && trigger) {
      const conditionCount = conditionGroups.reduce((total, group) => total + group.conditions.length, 0);
      return `Advanced: ${conditionCount} conditions across ${conditionGroups.length} groups`;
    }
    
    return 'No advanced trigger configured';
  };

  const getActionDelay = (action: any) => {
    return action.delay && action.delay > 0 ? `+${action.delay}s` : 'Immediate';
  };

  const isValid = automationName && (trigger || (triggerType === 'advanced' && conditionGroups.length > 0)) && actions.length > 0;

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {generateSummary()}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${isValid ? 'text-green-500' : 'text-gray-400'}`} />
              Automation Preview
            </CardTitle>
            <Button 
              size="sm" 
              onClick={simulateExecution}
              disabled={!isValid || isSimulating}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              {isSimulating ? 'Simulating...' : 'Test Run'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Automation Overview */}
          <div className="flex items-center gap-2">
            <Badge variant={automationType === 'customer' ? 'default' : 'secondary'}>
              {automationType}
            </Badge>
            <span className="font-medium">{automationName || 'Untitled Automation'}</span>
            {!isValid && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Incomplete
              </Badge>
            )}
          </div>

          {/* Trigger Section */}
          <div className={`p-3 rounded-lg border ${isSimulating && simulationStep >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-muted/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isSimulating && simulationStep >= 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium text-sm">TRIGGER</span>
              <Badge variant="outline" className="text-xs">{triggerType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getTriggerSummary()}</p>
            
            {triggerType === 'advanced' && conditionGroups.length > 0 && (
              <div className="mt-2 space-y-1">
                {conditionGroups.map((group, index) => (
                  <div key={group.id} className="text-xs bg-white p-2 rounded border">
                    <span className="font-medium">Group {index + 1} ({group.logic}):</span>
                    <span className="ml-1">{group.conditions.length} conditions</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Flow */}
          <div className="space-y-2">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <div key={action.id}>
                  <div className="flex items-center gap-2 my-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className={`p-3 rounded-lg border ${isSimulating && simulationStep > index ? 'bg-green-50 border-green-200' : isSimulating && simulationStep === index + 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-muted/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isSimulating && simulationStep > index ? 'bg-green-500' : isSimulating && simulationStep === index + 1 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="font-medium text-sm">ACTION {index + 1}</span>
                      <Badge variant="outline" className="text-xs">{getActionDelay(action)}</Badge>
                    </div>
                    <p className="text-sm font-medium">{action.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.type === 'send_email' && `To: ${action.config.recipient || 'Not specified'}`}
                      {action.type === 'call_webhook' && `URL: ${action.config.url || 'Not specified'}`}
                      {action.type === 'update_field' && `Field: ${action.config.field || 'Not specified'}`}
                      {action.type === 'assign_user' && `User: ${action.config.user_id || 'Not specified'}`}
                      {action.type === 'change_status' && `Status: ${action.config.status || 'Not specified'}`}
                      {action.type === 'create_task' && `Task: ${action.config.title || 'Not specified'}`}
                      {action.type === 'add_tag' && `Tag: ${action.config.tag || 'Not specified'}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No actions configured</p>
              </div>
            )}
          </div>

          {/* Execution Summary */}
          {isValid && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800">Ready to Deploy</span>
              </div>
              <p className="text-xs text-blue-600">
                This automation will execute {actions.length} action{actions.length !== 1 ? 's' : ''} when triggered.
                {actions.some(a => a.delay > 0) && ' Some actions have delays configured.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationPreview;
