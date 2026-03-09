import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  Edge,
  Connection,
  Node,
  NodeMouseHandler,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { CustomNode, WorkflowNodeType, NodeCategory, WorkflowTemplate } from './workflow/types';
import { getDefaultNodeName, getDefaultCategory } from './workflow/workflowUtils';
import NodePalette from './workflow/NodePalette';
import WorkflowCanvas from './workflow/WorkflowCanvas';
import NodeConfigPanel from './workflow/NodeConfigPanel';
import TemplateGallery from './workflow/TemplateGallery';
import ExecutionLogPanel from './workflow/ExecutionLog';
import { useWorkflowAutomations } from '@/hooks/useWorkflowAutomations';
import { useWorkflowExecutor } from '@/hooks/useWorkflowExecutor';

interface ModernAutomationBuilderProps {
  onClose: () => void;
  automationId?: string;
  initialData?: {
    name: string;
    nodes: CustomNode[];
    edges: Edge[];
  };
}

const ModernAutomationBuilderInner = ({ onClose, automationId, initialData }: ModernAutomationBuilderProps) => {
  const { createAutomation, updateAutomation } = useWorkflowAutomations();
  const { executionState, execute, reset } = useWorkflowExecutor();
  const [showTemplates, setShowTemplates] = useState(!initialData?.nodes?.length);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState(initialData?.name || 'Untitled Workflow');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Sync execution status onto nodes for visual feedback
  useEffect(() => {
    const { results } = executionState;
    if (Object.keys(results).length === 0) return;

    setNodes((nds) =>
      nds.map((node) => {
        const result = results[node.id];
        if (result) {
          return {
            ...node,
            data: { ...node.data, executionStatus: result.status },
          };
        }
        return node;
      })
    );
  }, [executionState.results, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_event, node: Node) => {
    setSelectedNode(node as CustomNode);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleDragStart = (
    event: React.DragEvent,
    nodeType: WorkflowNodeType,
    nodeName: string,
    category: NodeCategory
  ) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/name', nodeName);
    event.dataTransfer.setData('application/reactflow/category', category);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow/type') as WorkflowNodeType;
      const name = event.dataTransfer.getData('application/reactflow/name');
      const category = event.dataTransfer.getData('application/reactflow/category') as NodeCategory;
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 112,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newNode: CustomNode = {
        id: Date.now().toString(),
        type: 'workflowNode',
        position,
        data: {
          type,
          name: name || getDefaultNodeName(type),
          category: category || getDefaultCategory(type),
          config: {},
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleUpdateNode = (nodeId: string, data: Partial<CustomNode['data']>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, ...data } };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setWorkflowName(template.name);
    setShowTemplates(false);
  };

  const handleStartFromScratch = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('New Workflow');
    setShowTemplates(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Strip execution status before saving
      const cleanNodes = nodes.map((n) => ({
        ...n,
        data: { ...n.data, executionStatus: undefined },
      }));
      if (automationId) {
        await updateAutomation({ id: automationId, name: workflowName, nodes: cleanNodes, edges });
        toast.success('Workflow saved');
      } else {
        await createAutomation({ name: workflowName, nodes: cleanNodes, edges });
        toast.success('Workflow created');
      }
      onClose();
    } catch {
      // Error toast handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestRun = async () => {
    await execute(nodes, edges);
  };

  const handleResetExecution = () => {
    reset();
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, executionStatus: undefined },
      }))
    );
  };

  if (showTemplates) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Create Automation</h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <TemplateGallery onSelectTemplate={handleSelectTemplate} onStartFromScratch={handleStartFromScratch} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(executionState.results).length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleResetExecution}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestRun}
            disabled={executionState.isRunning || nodes.length === 0}
          >
            {executionState.isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Run
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-64 flex-shrink-0 overflow-hidden">
          <NodePalette onDragStart={handleDragStart} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div ref={reactFlowWrapper} className="flex-1 min-h-0">
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          </div>

          <ExecutionLogPanel logs={executionState.logs} isRunning={executionState.isRunning} />
        </div>

        {selectedNode && (
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ModernAutomationBuilder = (props: ModernAutomationBuilderProps) => {
  return (
    <ReactFlowProvider>
      <ModernAutomationBuilderInner {...props} />
    </ReactFlowProvider>
  );
};

export default ModernAutomationBuilder;
