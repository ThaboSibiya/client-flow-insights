
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
import { Button } from "@/components/ui/button";
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play, Pause, Trash2 } from "lucide-react";

import ConditionalBranching from './ConditionalBranching';
import LoopConfiguration from './LoopConfiguration';
import ErrorHandlingConfig from './ErrorHandlingConfig';
import ApprovalWorkflow from './ApprovalWorkflow';
import WorkflowNodeComponent from './WorkflowNodeComponent';

export type WorkflowNodeType = 'condition' | 'loop' | 'approval' | 'error_handler' | 'action';

export interface WorkflowNodeData {
  name: string;
  type: WorkflowNodeType;
  config: Record<string, any>;
}

export type CustomNode = Node<WorkflowNodeData>;

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

const getDefaultNodeName = (type: WorkflowNodeType): string => {
  switch (type) {
    case 'condition': return 'If/Then Branch';
    case 'loop': return 'For Each Loop';
    case 'approval': return 'Approval Step';
    case 'error_handler': return 'Error Handler';
    default: return 'Action Step';
  }
};

const getNodeIcon = (type: WorkflowNodeType) => {
    switch (type) {
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'loop': return <RefreshCw className="h-4 w-4" />;
      case 'approval': return <UserCheck className="h-4 w-4" />;
      case 'error_handler': return <AlertTriangle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
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
              disabled={isExecuting || nodes.length === 0}
              className="ml-auto"
            >
              {isExecuting ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isExecuting ? 'Executing...' : 'Test Workflow'}
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg h-[500px] bg-muted/20 relative">
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
      )}
    </div>
  );
};

export default WorkflowEngine;
