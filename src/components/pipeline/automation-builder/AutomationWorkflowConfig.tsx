
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";

interface AutomationWorkflowConfigProps {
  workflow: any;
  setWorkflow: (workflow: any) => void;
}

const AutomationWorkflowConfig = ({ workflow, setWorkflow }: AutomationWorkflowConfigProps) => {
  const addWorkflowNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      data: { label: 'New Action' },
      position: { x: Math.random() * 300, y: Math.random() * 200 }
    };
    
    setWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Workflow Designer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Visual Workflow Builder</h3>
          <p className="text-gray-500 mb-4">
            Design complex automation workflows with conditional branching and parallel actions.
          </p>
          <Button onClick={addWorkflowNode} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Workflow Node
          </Button>
          
          {workflow.nodes.length > 0 && (
            <div className="mt-4 text-left">
              <h4 className="font-medium mb-2">Workflow Nodes:</h4>
              <ul className="space-y-1">
                {workflow.nodes.map((node: any) => (
                  <li key={node.id} className="text-sm text-gray-600">
                    • {node.data.label} ({node.type})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationWorkflowConfig;
