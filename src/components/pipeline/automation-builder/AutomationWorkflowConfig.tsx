
import React from 'react';
import WorkflowEngine from '../workflow/WorkflowEngine';
import { CustomNode } from '../workflow/types';
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
    <div className="h-full">
      <WorkflowEngine
        onWorkflowChange={handleWorkflowChange}
        initialNodes={workflow.nodes}
        initialEdges={workflow.edges}
      />
    </div>
  );
};

export default AutomationWorkflowConfig;
