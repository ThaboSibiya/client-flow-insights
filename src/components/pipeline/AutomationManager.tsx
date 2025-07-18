
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

        {/* Use the single AutomationTabs component with proper event handling */}
        <AutomationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          automations={automations}
          onToggleAutomation={toggleAutomation}
          onCreateNew={() => setIsBuilderOpen(true)}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
      </div>
    </AutomationErrorBoundary>
  );
};

export default AutomationManager;
