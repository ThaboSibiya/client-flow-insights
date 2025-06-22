
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationHeader from './automation/AutomationHeader';
import AutomationTabs from './automation/AutomationTabs';
import PerformanceMonitor from './PerformanceMonitor';
import AutomationPermissions from './automation/permissions/AutomationPermissions';
import AutomationAuditLog from './automation/audit/AutomationAuditLog';
import AutomationErrorBoundary from './automation/error-handling/AutomationErrorBoundary';
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

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('automations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const newStatus = !automation.isActive;
    
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, isActive: newStatus } : auto
      )
    );

    // Log the automation status change
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
  };

  const handleAutomationError = (error: Error, errorInfo: any) => {
    console.error('Automation Manager Error:', { error, errorInfo });
    // Additional error handling logic could go here
  };

  return (
    <AutomationErrorBoundary onError={handleAutomationError}>
      <div className="space-y-6">
        <AutomationHeader 
          isBuilderOpen={isBuilderOpen}
          onBuilderOpenChange={setIsBuilderOpen}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="automations">
            <AutomationTabs
              activeTab="automations"
              onTabChange={() => {}}
              automations={automations}
              onToggleAutomation={toggleAutomation}
              onCreateNew={() => setIsBuilderOpen(true)}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="permissions">
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Select an automation to manage its permissions
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {automations.map((automation) => (
                  <div
                    key={automation.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAutomationId === automation.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAutomationId(automation.id)}
                  >
                    <h3 className="font-medium">{automation.name}</h3>
                    <p className="text-sm text-muted-foreground">{automation.type}</p>
                  </div>
                ))}
              </div>
              {selectedAutomationId && (
                <AutomationPermissions
                  automationId={selectedAutomationId}
                  onPermissionChange={(permissions) => {
                    console.log('Permissions updated:', permissions);
                  }}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <AutomationAuditLog automationId={selectedAutomationId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AutomationErrorBoundary>
  );
};

export default AutomationManager;
