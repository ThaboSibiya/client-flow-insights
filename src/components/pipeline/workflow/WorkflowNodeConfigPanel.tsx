
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CustomNode } from './types';
import { getNodeIcon } from './workflowUtils';
import ConditionalBranching from './ConditionalBranching';
import LoopConfiguration from './LoopConfiguration';
import ErrorHandlingConfig from './ErrorHandlingConfig';
import ApprovalWorkflow from './ApprovalWorkflow';

interface WorkflowNodeConfigPanelProps {
  selectedNode: CustomNode;
  updateNode: (nodeId: string, updates: Partial<CustomNode>) => void;
  removeSelectedNode: () => void;
}

const WorkflowNodeConfigPanel = ({ selectedNode, updateNode, removeSelectedNode }: WorkflowNodeConfigPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {getNodeIcon(selectedNode.data.type)}
              Configure: {selectedNode.data.name}
            </CardTitle>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={removeSelectedNode}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedNode.data.type === 'condition' && (
          <ConditionalBranching 
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}
        {selectedNode.data.type === 'loop' && (
          <LoopConfiguration 
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}
        {selectedNode.data.type === 'error_handler' && (
          <ErrorHandlingConfig 
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}
        {selectedNode.data.type === 'approval' && (
          <ApprovalWorkflow 
            node={selectedNode}
            onUpdate={(updates) => updateNode(selectedNode.id, updates)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowNodeConfigPanel;
