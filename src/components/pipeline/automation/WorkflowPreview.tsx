import React from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from '../workflow/types';
import { Edge } from '@xyflow/react';
import WorkflowNodeComponent from '../workflow/WorkflowNodeComponent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const nodeTypes = { workflowNode: WorkflowNodeComponent };

interface WorkflowPreviewProps {
  name: string;
  nodes: CustomNode[];
  edges: Edge[];
  isActive: boolean;
  lastTriggered?: string;
  triggerCount?: number;
  onEdit: () => void;
}

const WorkflowPreview = ({ name, nodes, edges, isActive, lastTriggered, triggerCount, onEdit }: WorkflowPreviewProps) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <Zap className="h-12 w-12 mx-auto mb-4 text-primary/50" />
          <h3 className="text-lg font-medium mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">This workflow has no nodes yet</p>
          <Button onClick={onEdit} size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Open Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Info bar */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {triggerCount !== undefined && triggerCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              {triggerCount} runs
            </span>
          )}
          {lastTriggered && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lastTriggered), { addSuffix: true })}
            </span>
          )}
          <Button onClick={onEdit} size="sm" variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Read-only canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
          }}
          className="bg-background"
        >
          <Controls className="bg-background border rounded-lg shadow-lg" showInteractive={false} />
          <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
          <MiniMap
            className="bg-background border rounded-lg shadow-lg"
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowPreview;
