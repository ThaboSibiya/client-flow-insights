
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";

interface AutomationFlowProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
  isValid: boolean;
  isSimulating: boolean;
  simulationStep: number;
  triggerEvalResult: 'pass' | 'fail' | null;
}

const AutomationFlow = ({
    automationName,
    automationType,
    triggerType,
    actions,
    conditionGroups = [],
    simpleTrigger,
    isValid,
    isSimulating,
    simulationStep,
    triggerEvalResult,
}: AutomationFlowProps) => {

    const getTriggerSummary = () => {
        if (triggerType === 'simple') {
            return simpleTrigger || 'No trigger selected';
        }
        
        if (triggerType === 'advanced') {
            const conditionCount = conditionGroups.reduce((total, group) => total + group.conditions.length, 0);
            if (conditionCount === 0) return 'No advanced trigger configured';
            return `Advanced: ${conditionCount} conditions across ${conditionGroups.length} groups`;
        }
        
        return 'No trigger configured';
    };

    const getActionDelay = (action: any) => {
        return action.delay && action.delay > 0 ? `+${action.delay}s` : 'Immediate';
    };

    const triggerStyle = isSimulating && !triggerEvalResult
        ? 'bg-blue-50 border-blue-200 animate-pulse'
        : triggerEvalResult === 'pass'
            ? 'bg-green-50 border-green-200'
            : triggerEvalResult === 'fail'
                ? 'bg-red-50 border-red-200'
                : 'bg-muted/50';

    return (
        <>
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
        </>
    );
};

export default AutomationFlow;
