
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play } from "lucide-react";
import { WorkflowNodeData, WorkflowNodeType } from './WorkflowEngine';

const getNodeIcon = (type: WorkflowNodeType) => {
  switch (type) {
    case 'condition': return <GitBranch className="h-5 w-5" />;
    case 'loop': return <RefreshCw className="h-5 w-5" />;
    case 'approval': return <UserCheck className="h-5 w-5" />;
    case 'error_handler': return <AlertTriangle className="h-5 w-5" />;
    default: return <Play className="h-5 w-5" />;
  }
};

const WorkflowNodeComponent = ({ data, selected }: NodeProps<WorkflowNodeData>) => {
  const icon = getNodeIcon(data.type);

  return (
    <Card className={`w-64 border-2 ${selected ? 'border-blue-500 shadow-md' : 'border-border'}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{icon}</div>
          <div className="flex flex-col flex-grow">
            <span className="font-semibold leading-none tracking-tight">{data.name}</span>
            <Badge variant="outline" className="text-xs w-fit mt-1 capitalize">{data.type.replace('_', ' ')}</Badge>
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="!bg-gray-400 w-16 !h-2 rounded-md" />
        <Handle type="source" position={Position.Bottom} className="!bg-gray-400 w-16 !h-2 rounded-md" />
      </CardContent>
    </Card>
  );
};

export default WorkflowNodeComponent;
