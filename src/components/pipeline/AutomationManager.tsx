
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationHeader from './automation/AutomationHeader';
import AutomationTabs from './automation/AutomationTabs';
import AutomationPermissions from './automation/permissions/AutomationPermissions';
import AutomationAuditLog from './automation/audit/AutomationAuditLog';
import AutomationErrorBoundary from './automation/error-handling/AutomationErrorBoundary';
import MobileAutomationView from './automation/mobile/MobileAutomationView';
import BulkOperationsManager from './automation/bulk/BulkOperationsManager';
import AdvancedConditionalBuilder from './automation/conditional/AdvancedConditionalBuilder';
import TimeBasedTriggerManager from './automation/scheduling/TimeBasedTriggerManager';
import { automationAuditService } from '@/services/automationAuditService';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
  };

  const handleAutomationError = (error: Error, errorInfo: any) => {
    console.error('Automation Manager Error:', { error, errorInfo });
  };

  // Show mobile-optimized view on mobile devices
  if (isMobile && activeTab === 'automations') {
    return (
      <AutomationErrorBoundary onError={handleAutomationError}>
        <div className="space-y-6">
          <AutomationHeader 
            isBuilderOpen={isBuilderOpen}
            onBuilderOpenChange={setIsBuilderOpen}
          />
          <MobileAutomationView 
            automations={automations}
            onToggleAutomation={toggleAutomation}
          />
        </div>
      </AutomationErrorBoundary>
    );
  }

  return (
    <AutomationErrorBoundary onError={handleAutomationError}>
      <div className="space-y-6">
        <AutomationHeader 
          isBuilderOpen={isBuilderOpen}
          onBuilderOpenChange={setIsBuilderOpen}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
            <TabsTrigger value="conditional">Conditional</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
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
            <div className="text-center p-8">
              <h3 className="text-lg font-semibold mb-2">Performance Monitor</h3>
              <p className="text-muted-foreground">Performance monitoring functionality coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <BulkOperationsManager />
          </TabsContent>

          <TabsContent value="conditional">
            <AdvancedConditionalBuilder 
              onRulesChange={(rules) => console.log('Conditional rules updated:', rules)}
            />
          </TabsContent>

          <TabsContent value="scheduling">
            <TimeBasedTriggerManager />
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
