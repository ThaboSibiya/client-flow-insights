
import React, { useState, useCallback, useRef } from 'react';
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
import { ArrowLeft, Save, Play, Pause, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { CustomNode, WorkflowNodeType, NodeCategory, WorkflowTemplate } from './workflow/types';
import { getDefaultNodeName, getDefaultCategory } from './workflow/workflowUtils';
import NodePalette from './workflow/NodePalette';
import WorkflowCanvas from './workflow/WorkflowCanvas';
import NodeConfigPanel from './workflow/NodeConfigPanel';
import TemplateGallery from './workflow/TemplateGallery';

interface ModernAutomationBuilderProps {
  onClose: () => void;
  initialData?: any;
}

const ModernAutomationBuilderInner = ({ onClose, initialData }: ModernAutomationBuilderProps) => {
  const [showTemplates, setShowTemplates] = useState(!initialData?.nodes?.length);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowName, setWorkflowName] = useState(initialData?.name || 'Untitled Workflow');
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 } 
      }, eds));
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
          const updatedNode = {
            ...node,
            data: { ...node.data, ...data },
          };
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

  const handleSave = () => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
    };
    console.log('Saving workflow:', workflow);
    toast.success('Workflow saved successfully!');
    onClose();
  };

  const handleTestRun = async () => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first');
      return;
    }

    setIsExecuting(true);
    toast.info('Testing workflow...');
    
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Executing: ${nodes[i].data.name}`);
    }
    
    setIsExecuting(false);
    toast.success('Workflow test completed!');
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
          <TemplateGallery 
            onSelectTemplate={handleSelectTemplate}
            onStartFromScratch={handleStartFromScratch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTestRun}
            disabled={isExecuting || nodes.length === 0}
          >
            {isExecuting ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Run
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Node Palette */}
        <div className="w-72 flex-shrink-0">
          <NodePalette onDragStart={handleDragStart} />
        </div>

        {/* Center - Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 min-w-0">
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

        {/* Right Sidebar - Config Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
          />
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
