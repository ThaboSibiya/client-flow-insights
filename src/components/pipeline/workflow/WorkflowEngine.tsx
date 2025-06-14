
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play, Pause } from "lucide-react";
import ConditionalBranching from './ConditionalBranching';
import LoopConfiguration from './LoopConfiguration';
import ErrorHandlingConfig from './ErrorHandlingConfig';
import ApprovalWorkflow from './ApprovalWorkflow';

interface WorkflowNode {
  id: string;
  type: 'action' | 'condition' | 'loop' | 'approval' | 'error_handler';
  name: string;
  config: Record<string, any>;
  connections: string[];
  position: { x: number; y: number };
}

interface WorkflowEngineProps {
  onWorkflowChange: (nodes: WorkflowNode[]) => void;
  initialNodes?: WorkflowNode[];
}

const WorkflowEngine = ({ onWorkflowChange, initialNodes = [] }: WorkflowEngineProps) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      name: getDefaultNodeName(type),
      config: {},
      connections: [],
      position: { x: Math.random() * 400, y: Math.random() * 300 }
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onWorkflowChange(updatedNodes);
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    setNodes(updatedNodes);
    onWorkflowChange(updatedNodes);
  };

  const removeNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    setNodes(updatedNodes);
    onWorkflowChange(updatedNodes);
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const getDefaultNodeName = (type: WorkflowNode['type']): string => {
    switch (type) {
      case 'condition': return 'If/Then Branch';
      case 'loop': return 'For Each Loop';
      case 'approval': return 'Approval Step';
      case 'error_handler': return 'Error Handler';
      default: return 'Action Step';
    }
  };

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'loop': return <RefreshCw className="h-4 w-4" />;
      case 'approval': return <UserCheck className="h-4 w-4" />;
      case 'error_handler': return <AlertTriangle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const simulateExecution = async () => {
    setIsExecuting(true);
    // Simulate workflow execution with delays
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Executing node: ${nodes[i].name}`);
    }
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Toolbar */}
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

          {/* Workflow Canvas */}
          <div className="border-2 border-dashed rounded-lg p-4 min-h-[400px] bg-muted/20 relative">
            {nodes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workflow nodes yet</p>
                <p className="text-sm">Add conditional branches, loops, or approval steps to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <Card 
                      className={`flex-1 cursor-pointer transition-colors ${selectedNode?.id === node.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNodeIcon(node.type)}
                            <span className="font-medium">{node.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {node.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNode(node.id);
                            }}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getNodeIcon(selectedNode.type)}
              Configure {selectedNode.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode.type === 'condition' && (
              <ConditionalBranching 
                node={selectedNode}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
              />
            )}
            {selectedNode.type === 'loop' && (
              <LoopConfiguration 
                node={selectedNode}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
              />
            )}
            {selectedNode.type === 'error_handler' && (
              <ErrorHandlingConfig 
                node={selectedNode}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
              />
            )}
            {selectedNode.type === 'approval' && (
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
