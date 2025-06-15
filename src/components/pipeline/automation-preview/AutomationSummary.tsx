
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface AutomationSummaryProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
}

const AutomationSummary = ({ 
  automationType, 
  triggerType, 
  actions,
  conditionGroups = [],
  simpleTrigger,
}: AutomationSummaryProps) => {

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

  return (
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
  );
};

export default AutomationSummary;
