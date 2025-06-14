
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEngine from '../workflow/WorkflowEngine';

interface AutomationWorkflowConfigProps {
  workflowNodes: any[];
  setWorkflowNodes: (nodes: any[]) => void;
}

const AutomationWorkflowConfig = ({
  workflowNodes,
  setWorkflowNodes
}: AutomationWorkflowConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Workflow Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <WorkflowEngine
          onWorkflowChange={setWorkflowNodes}
          initialNodes={workflowNodes}
        />
      </CardContent>
    </Card>
  );
};

export default AutomationWorkflowConfig;
