
import React, { useState, useCallback, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

import { CustomNode, WorkflowNodeType } from './types';
import { getDefaultNodeName } from './workflowUtils';
import WorkflowNodeComponent from './WorkflowNodeComponent';
import WorkflowToolbar from './WorkflowToolbar';
import WorkflowNodeConfigPanel from './WorkflowNodeConfigPanel';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

interface WorkflowEngineProps {
  onWorkflowChange: (nodes: CustomNode[], edges: Edge[]) => void;
  initialNodes?: CustomNode[];
  initialEdges?: Edge[];
}

const WorkflowEngine = ({ onWorkflowChange, initialNodes = [], initialEdges = [] }: WorkflowEngineProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    onWorkflowChange(nodes, edges);
  }, [nodes, edges, onWorkflowChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6b7280' } }, eds)),
    [setEdges]
  );
  
  const onNodeClick: NodeMouseHandler = useCallback((_event, node: Node) => {
    setSelectedNode(node as CustomNode);
  }, []);

  const addNode = (type: WorkflowNodeType) => {
    const newNode: CustomNode = {
      id: Date.now().toString(),
      type: 'workflowNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 150 + 50 },
      data: {
        type,
        name: getDefaultNodeName(type),
        config: {},
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNode = (nodeId: string, updates: Partial<CustomNode>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // This ensures deep data properties are merged correctly.
          const updatedNode = { 
            ...node, 
            ...updates,
            data: {
              ...node.data,
              ...updates.data,
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };
  
  const removeSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const simulateExecution = async () => {
    setIsExecuting(true);
    // Simulate workflow execution with delays
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Executing node: ${nodes[i].data.name}`);
    }
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Advanced Workflow Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowToolbar 
            addNode={addNode}
            simulateExecution={simulateExecution}
            isExecuting={isExecuting}
            hasNodes={nodes.length > 0}
          />

          <div className="border-2 border-dashed rounded-lg h-[600px] bg-muted/20 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
              <MiniMap />
            </ReactFlow>
            {nodes.length === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground pointer-events-none">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workflow nodes yet</p>
                <p className="text-sm">Add conditional branches, loops, or approval steps to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedNode && (
        <WorkflowNodeConfigPanel
          selectedNode={selectedNode}
          updateNode={updateNode}
          removeSelectedNode={removeSelectedNode}
        />
      )}
    </div>
  );
};

export default WorkflowEngine;
