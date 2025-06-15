import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, Play, AlertCircle, Info, TestTube2, FileText } from "lucide-react";
import { useCustomerData } from '@/hooks/useCustomerData';
import { Customer } from '@/types/customer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);
  const [simulationLog, setSimulationLog] = React.useState<string[]>([]);
  const [triggerEvalResult, setTriggerEvalResult] = React.useState<'pass' | 'fail' | null>(null);

  const { customers } = useCustomerData();
  const { toast } = useToast();

  const evaluateCondition = (condition: any, record: any): { met: boolean; log: string } => {
    const { field, operator, value: conditionValue, type } = condition;
    const fieldPath = field.split('.');

    let actualValue: any = record;
    for (const part of fieldPath.slice(1)) { // a/c for 'customer.name' or 'ticket.status'
      if (actualValue && typeof actualValue === 'object' && part in actualValue) {
        actualValue = actualValue[part];
      } else {
        return { met: false, log: `Field "${field}" not found on record.` };
      }
    }

    const logMessage = `Condition: [${field}] ("${actualValue}") ${operator} ("${conditionValue}")`;
    if (actualValue === null || actualValue === undefined) {
      return { met: false, log: `${logMessage} -> FAILED (field has no value)` };
    }

    let result = false;
    try {
      switch (type) {
        case 'text':
          const strValue = String(actualValue);
          switch (operator) {
            case 'equals': result = strValue.toLowerCase() === conditionValue.toLowerCase(); break;
            case 'not_equals': result = strValue.toLowerCase() !== conditionValue.toLowerCase(); break;
            case 'contains': result = strValue.toLowerCase().includes(conditionValue.toLowerCase()); break;
            case 'starts_with': result = strValue.toLowerCase().startsWith(conditionValue.toLowerCase()); break;
            case 'ends_with': result = strValue.toLowerCase().endsWith(conditionValue.toLowerCase()); break;
          }
          break;
        case 'number':
          const numValue = Number(actualValue);
          const numConditionValue = Number(conditionValue);
          if (isNaN(numValue) || isNaN(numConditionValue)) return { met: false, log: `${logMessage} -> FAILED (invalid number)` };
          switch (operator) {
            case 'equals': result = numValue === numConditionValue; break;
            case 'greater_than': result = numValue > numConditionValue; break;
            case 'less_than': result = numValue < numConditionValue; break;
            case 'greater_equal': result = numValue >= numConditionValue; break;
            case 'less_equal': result = numValue <= numConditionValue; break;
          }
          break;
        case 'date':
            const dateValue = new Date(actualValue);
            dateValue.setHours(0, 0, 0, 0);

            if (isNaN(dateValue.getTime())) return { met: false, log: `${logMessage} -> FAILED (invalid date in record)`};

            if (['days_ago', 'days_from_now'].includes(operator)) {
                const numDays = parseInt(conditionValue, 10);
                if (isNaN(numDays)) return { met: false, log: `${logMessage} -> FAILED (invalid number of days)` };
                
                const compareDate = new Date();
                compareDate.setHours(0,0,0,0);
                compareDate.setDate(compareDate.getDate() + (operator === 'days_ago' ? -numDays : numDays));
                result = dateValue.getTime() === compareDate.getTime();
            } else {
                const compareDate = new Date(conditionValue);
                compareDate.setHours(0,0,0,0);
                if (isNaN(compareDate.getTime())) return { met: false, log: `${logMessage} -> FAILED (invalid date value)` };

                switch (operator) {
                    case 'equals': result = dateValue.getTime() === compareDate.getTime(); break;
                    case 'before': result = dateValue.getTime() < compareDate.getTime(); break;
                    case 'after': result = dateValue.getTime() > compareDate.getTime(); break;
                }
            }
            break;
      }
    } catch (e: any) {
      return { met: false, log: `${logMessage} -> ERROR (${e.message})` };
    }
    return { met: result, log: `${logMessage} -> ${result ? 'PASSED' : 'FAILED'}` };
  };

  const simulateExecution = async () => {
    if (!selectedRecordId) {
      toast({ title: "Please select a record to test with.", variant: "destructive" });
      return;
    }
    const selectedRecord = automationType === 'customer' ? customers.find(c => c.id === selectedRecordId) : null;
    if (!selectedRecord) {
      toast({ title: "Selected record not found.", variant: "destructive" });
      return;
    }

    setIsSimulating(true);
    setTriggerEvalResult(null);
    const newLog: string[] = [];
    const addLog = (message: string) => {
      newLog.push(`[${new Date().toLocaleTimeString()}] ${message}`);
      setSimulationLog([...newLog]);
    };
    
    addLog(`[START] Simulating with ${automationType}: ${selectedRecord.name}`);
    setSimulationStep(0); // Trigger step
    await new Promise(r => setTimeout(r, 200));

    let triggerMet = false;
    if (triggerType === 'simple') {
      triggerMet = true;
      addLog(`[TRIGGER] Simple trigger "${simpleTrigger}" assumed PASSED for simulation.`);
    } else {
      addLog(`[TRIGGER] Evaluating advanced trigger conditions...`);
      let overallResult = true; // Assumes AND logic between groups for now
      for (const [i, group] of conditionGroups.entries()) {
        addLog(` -> Evaluating Group ${i + 1} (${group.logic})`);
        const conditionResults: boolean[] = [];
        for (const condition of group.conditions) {
          const { met, log } = evaluateCondition(condition, selectedRecord);
          conditionResults.push(met);
          addLog(`    - ${log}`);
          await new Promise(r => setTimeout(r, 50));
        }
        const groupResult = group.logic === 'AND' ? conditionResults.every(r => r) : conditionResults.some(r => r);
        addLog(` -> Group ${i + 1} result: ${groupResult ? 'PASSED' : 'FAILED'}`);
        if (!groupResult) {
          overallResult = false;
          break;
        }
      }
      triggerMet = overallResult;
    }
    
    setTriggerEvalResult(triggerMet ? 'pass' : 'fail');
    addLog(`[TRIGGER] Overall result: ${triggerMet ? 'PASSED' : 'FAILED'}`);

    if (triggerMet) {
      for (let i = 0; i < actions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSimulationStep(i + 1);
        addLog(` -> Executing Action ${i + 1}: ${actions[i].name}.`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      setSimulationStep(actions.length + 1);
      addLog(`[END] Simulation finished successfully.`);
    } else {
      addLog(`[END] Automation did not run.`);
    }

    setIsSimulating(false);
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

  const isValid = automationName && (simpleTrigger || (triggerType === 'advanced' && conditionGroups.length > 0)) && actions.length > 0;

  const triggerStyle = isSimulating && !triggerEvalResult
    ? 'bg-blue-50 border-blue-200 animate-pulse'
    : triggerEvalResult === 'pass'
        ? 'bg-green-50 border-green-200'
        : triggerEvalResult === 'fail'
            ? 'bg-red-50 border-red-200'
            : 'bg-muted/50';

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
              <TestTube2 className={`h-5 w-5 ${isValid ? 'text-blue-500' : 'text-gray-400'}`} />
              Automation Test Lab
            </CardTitle>
            <Button 
              size="sm" 
              onClick={simulateExecution}
              disabled={!isValid || isSimulating || !selectedRecordId}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              {isSimulating ? 'Simulating...' : 'Run Test with Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Data Selector */}
          <div className="space-y-2">
            <Label htmlFor="test-data-selector">Test with real data</Label>
            <Select onValueChange={setSelectedRecordId} value={selectedRecordId || ""}>
                <SelectTrigger id="test-data-selector">
                  <SelectValue placeholder={`Select a ${automationType}...`} />
                </SelectTrigger>
                <SelectContent>
                  {automationType === 'customer' && customers.map((c: Customer) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                  {automationType === 'ticket' && (
                    <SelectItem value="disabled" disabled>Ticket data not yet supported</SelectItem>
                  )}
                </SelectContent>
            </Select>
          </div>

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
          <div className={`p-3 rounded-lg border transition-colors ${triggerStyle}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${triggerStyle.includes('green') ? 'bg-green-500' : triggerStyle.includes('red') ? 'bg-red-500' : triggerStyle.includes('blue') ? 'bg-blue-500' : 'bg-gray-400'}`} />
              <span className="font-medium text-sm">TRIGGER</span>
              <Badge variant="outline" className="text-xs">{triggerType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{getTriggerSummary()}</p>
            
            {triggerType === 'advanced' && conditionGroups.length > 0 && (
              <div className="mt-2 space-y-1">
                {conditionGroups.map((group, index) => (
                  <div key={group.id} className="text-xs bg-white dark:bg-zinc-800 p-2 rounded border">
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
                  <div className={`p-3 rounded-lg border transition-colors ${isSimulating && simulationStep > index ? 'bg-green-50 border-green-200' : isSimulating && simulationStep === index + 1 ? 'bg-blue-50 border-blue-200 animate-pulse' : 'bg-muted/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isSimulating && simulationStep > index ? 'bg-green-500' : isSimulating && simulationStep === index + 1 ? 'bg-blue-500' : 'bg-gray-400'}`} />
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

          {/* Simulation Log */}
          {simulationLog.length > 0 && (
            <div className="space-y-2 pt-4">
              <h4 className="font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Simulation Log</h4>
              <ScrollArea className="h-48 w-full rounded-md border bg-muted/30 font-mono text-xs">
                <div className="p-3">
                  {simulationLog.map((log, i) => (
                    <p key={i} className="whitespace-pre-wrap">{log}</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationPreview;
