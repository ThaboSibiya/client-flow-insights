
import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode, WorkflowNodeType, NodeCategory } from './types';
import WorkflowNodeComponent from './WorkflowNodeComponent';
import { GitBranch } from 'lucide-react';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

interface WorkflowCanvasProps {
  nodes: CustomNode[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: NodeMouseHandler;
  onPaneClick: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}

const WorkflowCanvasInner = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDrop,
  onDragOver,
}: WorkflowCanvasProps) => {
  return (
    <div className="h-full w-full relative bg-muted/20 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        className="bg-background"
      >
        <Controls className="bg-background border rounded-lg shadow-lg" />
        <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
        <MiniMap 
          className="bg-background border rounded-lg shadow-lg" 
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
      
      {nodes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground pointer-events-none">
          <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Drag nodes here to build your workflow</p>
          <p className="text-sm mt-1">Or select a template to get started quickly</p>
        </div>
      )}
    </div>
  );
};

const WorkflowCanvas = (props: WorkflowCanvasProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
