
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
    <Card className="bg-quikle-blue/10 border-quikle-blue/20 dark:bg-quikle-blue/20 dark:border-quikle-blue/30">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-quikle-blue dark:text-quikle-platinum mt-0.5 flex-shrink-0" />
          <p className="text-sm text-quikle-blue dark:text-quikle-platinum">
            {generateSummary()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSummary;
