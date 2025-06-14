
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedActionsBuilder from '../EnhancedActionsBuilder';

interface AutomationActionsConfigProps {
  actions: any[];
  setActions: (actions: any[]) => void;
}

const AutomationActionsConfig = ({
  actions,
  setActions
}: AutomationActionsConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedActionsBuilder
          onActionsChange={setActions}
          initialActions={actions}
        />
      </CardContent>
    </Card>
  );
};

export default AutomationActionsConfig;
