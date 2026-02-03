import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Webhook, Activity } from 'lucide-react';
import { toast } from 'sonner';

import WorkflowSidebar from './automation/WorkflowSidebar';
import ModernAutomationBuilder from './ModernAutomationBuilder';
import ActivityTab from './automation/ActivityTab';
import IntegrationsTab from './automation/IntegrationsTab';
import { automationAuditService } from '@/services/automationAuditService';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

const AutomationManager = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Welcome New Customers',
      trigger: 'Customer moves to "New Leads"',
      actions: ['Send welcome email', 'Assign to sales rep'],
      isActive: true,
      type: 'customer',
      triggerType: 'simple',
      lastTriggered: '2024-06-14T10:30:00Z',
      triggerCount: 45
    },
    {
      id: '2',
      name: 'High Priority Ticket Alert',
      trigger: 'Ticket priority set to "Urgent"',
      actions: ['Send SMS notification', 'Assign to manager'],
      isActive: true,
      type: 'ticket',
      triggerType: 'simple',
      lastTriggered: '2024-06-14T09:15:00Z',
      triggerCount: 12
    },
    {
      id: '3',
      name: 'Follow-up Reminder',
      trigger: 'Customer in "Contacted" for 3 days',
      actions: ['Create follow-up task', 'Send reminder email'],
      isActive: false,
      type: 'customer',
      triggerType: 'time',
      triggerCount: 0
    },
    {
      id: '4',
      name: 'Zapier Integration Trigger',
      trigger: 'External webhook received',
      actions: ['Update customer status', 'Send notification'],
      isActive: true,
      type: 'customer',
      triggerType: 'webhook',
      lastTriggered: '2024-06-14T08:45:00Z',
      triggerCount: 78
    }
  ]);

  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const toggleAutomation = useCallback(async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const newStatus = !automation.isActive;
    
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, isActive: newStatus } : auto
      )
    );

    try {
      await automationAuditService.logAutomationAction(
        id,
        'updated',
        {
          field: 'status',
          oldValue: automation.isActive,
          newValue: newStatus,
          automationName: automation.name
        }
      );
    } catch (error) {
      console.error('Failed to log automation action:', error);
    }
  }, [automations]);

  const handleCreateNew = useCallback(() => {
    setEditingAutomation(null);
    setIsBuilderOpen(true);
  }, []);

  const handleEdit = useCallback((id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      setEditingAutomation(automation);
      setIsBuilderOpen(true);
    }
  }, [automations]);

  const handleDuplicate = useCallback((id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      const newAutomation: Automation = {
        ...automation,
        id: Date.now().toString(),
        name: `${automation.name} (Copy)`,
        isActive: false,
        triggerCount: 0,
        lastTriggered: undefined
      };
      setAutomations(prev => [...prev, newAutomation]);
      toast.success('Workflow duplicated');
    }
  }, [automations]);

  const handleDelete = useCallback((id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    if (selectedAutomationId === id) {
      setSelectedAutomationId(null);
    }
    toast.success('Workflow deleted');
  }, [selectedAutomationId]);

  const handleCloseBuilder = useCallback(() => {
    setIsBuilderOpen(false);
    setEditingAutomation(null);
  }, []);

  // If builder is open, show it full-screen
  if (isBuilderOpen) {
    return (
      <div className="h-[calc(100vh-12rem)] -mx-6 -mt-6">
        <ReactFlowProvider>
          <ModernAutomationBuilder 
            onClose={handleCloseBuilder}
            initialData={editingAutomation ? {
              name: editingAutomation.name,
              nodes: [],
              edges: []
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
            {/* Sidebar */}
            <WorkflowSidebar
              automations={automations}
              selectedId={selectedAutomationId}
              onSelect={setSelectedAutomationId}
              onToggle={toggleAutomation}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center bg-muted/10">
              {selectedAutomationId ? (
                <div className="text-center p-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                  <h3 className="text-lg font-medium mb-2">
                    {automations.find(a => a.id === selectedAutomationId)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Edit" to open the visual workflow builder
                  </p>
                  <button 
                    onClick={() => handleEdit(selectedAutomationId)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Open in Builder →
                  </button>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a Workflow</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a workflow from the sidebar or create a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ActivityTab automations={automations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationManager;
