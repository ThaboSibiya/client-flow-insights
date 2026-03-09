import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Webhook, Activity } from 'lucide-react';

import WorkflowSidebar from './automation/WorkflowSidebar';
import ModernAutomationBuilder from './ModernAutomationBuilder';
import ActivityTab from './automation/ActivityTab';
import IntegrationsTab from './automation/IntegrationsTab';
import { useWorkflowAutomations } from '@/hooks/useWorkflowAutomations';

const AutomationManager = () => {
  const {
    automations,
    isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    duplicateAutomation,
  } = useWorkflowAutomations();

  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);

  const sidebarAutomations = automations.map(a => ({
    id: a.id,
    name: a.name,
    trigger: a.trigger_type || 'simple',
    actions: [],
    isActive: a.is_active,
    type: 'customer' as const,
    triggerType: (a.trigger_type || 'simple') as 'simple' | 'advanced' | 'time' | 'webhook',
    lastTriggered: a.last_triggered_at || undefined,
    triggerCount: a.trigger_count,
  }));

  const toggleAutomation = useCallback(async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;
    await updateAutomation({ id, is_active: !automation.is_active });
  }, [automations, updateAutomation]);

  const handleCreateNew = useCallback(async () => {
    setEditingAutomationId(null);
    setIsBuilderOpen(true);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingAutomationId(id);
    setIsBuilderOpen(true);
  }, []);

  const handleDuplicate = useCallback(async (id: string) => {
    await duplicateAutomation(id);
  }, [duplicateAutomation]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteAutomation(id);
    if (selectedAutomationId === id) setSelectedAutomationId(null);
  }, [deleteAutomation, selectedAutomationId]);

  const handleCloseBuilder = useCallback(() => {
    setIsBuilderOpen(false);
    setEditingAutomationId(null);
  }, []);

  const editingAutomation = editingAutomationId
    ? automations.find(a => a.id === editingAutomationId)
    : null;

  if (isBuilderOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ReactFlowProvider>
          <ModernAutomationBuilder
            onClose={handleCloseBuilder}
            automationId={editingAutomation?.id}
            initialData={editingAutomation ? {
              name: editingAutomation.name,
              nodes: editingAutomation.nodes,
              edges: editingAutomation.edges,
            } : undefined}
          />
        </ReactFlowProvider>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-4">
          <div className="flex h-[calc(100vh-20rem)] border rounded-lg overflow-hidden bg-background">
            <WorkflowSidebar
              automations={sidebarAutomations}
              selectedId={selectedAutomationId}
              onSelect={setSelectedAutomationId}
              onToggle={toggleAutomation}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />

            <div className="flex-1 flex items-center justify-center bg-muted/10">
              {isLoading ? (
                <div className="text-center p-8">
                  <div className="h-8 w-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading workflows...</p>
                </div>
              ) : selectedAutomationId ? (
                <div className="text-center p-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <h3 className="text-lg font-medium mb-2">
                    {automations.find(a => a.id === selectedAutomationId)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Open the visual builder to edit this workflow
                  </p>
                  <button
                    onClick={() => handleEdit(selectedAutomationId)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Open Builder →
                  </button>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a Workflow</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a workflow from the sidebar or create a new one
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    Create Workflow
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityTab automations={sidebarAutomations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationManager;
