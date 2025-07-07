
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Zap, Clock, Target } from "lucide-react";

interface AutomationPreviewTabProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  simpleTrigger: string;
  conditionGroups: any[];
  actions: any[];
}

const AutomationPreviewTab = ({
  automationName,
  automationType,
  triggerType,
  simpleTrigger,
  conditionGroups,
  actions
}: AutomationPreviewTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Automation Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">{automationName || 'Untitled Automation'}</h3>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {automationType === 'customer' ? 'Customer Pipeline' : 'Ticket Pipeline'}
            </Badge>
            <Badge variant="secondary">
              {triggerType === 'simple' ? 'Simple Trigger' : 'Advanced Conditions'}
            </Badge>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4" />
            Trigger Configuration
          </h4>
          {triggerType === 'simple' ? (
            <p className="text-sm text-muted-foreground">
              {simpleTrigger || 'No trigger selected'}
            </p>
          ) : (
            <div className="space-y-2">
              {conditionGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conditions configured</p>
              ) : (
                conditionGroups.map((group, index) => (
                  <div key={group.id} className="border rounded p-2">
                    <Badge variant="outline" className="mb-2">Group {index + 1}</Badge>
                    {group.conditions.map((condition: any, condIndex: number) => (
                      <div key={condition.id} className="text-sm">
                        {condIndex > 0 && <span className="text-muted-foreground">{group.operator} </span>}
                        <span className="font-medium">{condition.field}</span>
                        <span className="text-muted-foreground"> {condition.operator} </span>
                        <span className="font-medium">{condition.value || '[empty]'}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Target className="h-4 w-4" />
            Actions ({actions.length})
          </h4>
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions configured</p>
          ) : (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div key={action.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{action.type}</span>
                  {action.target && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span>{action.target}</span>
                    </>
                  )}
                  {action.value && (
                    <>
                      <span className="text-muted-foreground">=</span>
                      <span>{action.value}</span>
                    </>
                  )}
                  {action.delay > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {action.delay}m delay
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="bg-muted p-3 rounded">
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">
            This automation will {triggerType === 'simple' ? `trigger on "${simpleTrigger}"` : `run when advanced conditions are met`} 
            {actions.length > 0 ? ` and execute ${actions.length} action${actions.length > 1 ? 's' : ''}` : ' but has no actions configured'}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationPreviewTab;
