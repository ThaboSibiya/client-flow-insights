
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowEngine from '../workflow/WorkflowEngine';
import { CustomNode } from '../workflow/WorkflowEngine';
import { Edge } from '@xyflow/react';

interface AutomationWorkflowConfigProps {
  workflow: { nodes: CustomNode[], edges: Edge[] };
  setWorkflow: (workflow: { nodes: CustomNode[], edges: Edge[] }) => void;
}

const AutomationWorkflowConfig = ({
  workflow,
  setWorkflow
}: AutomationWorkflowConfigProps) => {
  
  const handleWorkflowChange = (nodes: CustomNode[], edges: Edge[]) => {
    setWorkflow({ nodes, edges });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Workflow Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <WorkflowEngine
          onWorkflowChange={handleWorkflowChange}
          initialNodes={workflow.nodes}
          initialEdges={workflow.edges}
        />
      </CardContent>
    </Card>
  );
};

export default AutomationWorkflowConfig;
