
import React from 'react';
import { Button } from "@/components/ui/button";
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play, Pause } from "lucide-react";
import { WorkflowNodeType } from './types';

interface WorkflowToolbarProps {
  addNode: (type: WorkflowNodeType) => void;
  simulateExecution: () => void;
  isExecuting: boolean;
  hasNodes: boolean;
}

const WorkflowToolbar = ({ addNode, simulateExecution, isExecuting, hasNodes }: WorkflowToolbarProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button size="sm" onClick={() => addNode('condition')}>
        <GitBranch className="h-4 w-4 mr-1" />
        Add Branch
      </Button>
      <Button size="sm" onClick={() => addNode('loop')}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Add Loop
      </Button>
      <Button size="sm" onClick={() => addNode('approval')}>
        <UserCheck className="h-4 w-4 mr-1" />
        Add Approval
      </Button>
      <Button size="sm" onClick={() => addNode('error_handler')}>
        <AlertTriangle className="h-4 w-4 mr-1" />
        Add Error Handler
      </Button>
      <Button 
        size="sm" 
        onClick={simulateExecution}
        disabled={isExecuting || !hasNodes}
        className="ml-auto"
      >
        {isExecuting ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
        {isExecuting ? 'Executing...' : 'Test Workflow'}
      </Button>
    </div>
  );
};

export default WorkflowToolbar;
