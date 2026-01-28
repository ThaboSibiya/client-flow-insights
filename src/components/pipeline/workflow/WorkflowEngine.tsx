
import React, { useState, useCallback, useEffect } from 'react';
import {
  addEdge,
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

import { CustomNode, WorkflowNodeType, NodeCategory } from './types';
import { getDefaultNodeName, getDefaultCategory } from './workflowUtils';
import WorkflowNodeComponent from './WorkflowNodeComponent';
import WorkflowToolbar from './WorkflowToolbar';
import WorkflowNodeConfigPanel from './WorkflowNodeConfigPanel';
import WorkflowCanvas from './WorkflowCanvas';

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
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'hsl(var(--muted-foreground))' } }, eds)),
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
        category: getDefaultCategory(type),
        config: {},
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNode = (nodeId: string, updates: Partial<CustomNode>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
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
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              onDrop={() => {}}
              onDragOver={(e) => e.preventDefault()}
            />
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
