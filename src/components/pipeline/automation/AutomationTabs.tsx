
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, Webhook, Search, Settings, FileText } from "lucide-react";
import AutomationsList from './AutomationsList';
import AutomationAnalytics from './AutomationAnalytics';
import BulkOperationsManager from './bulk/BulkOperationsManager';
import AdvancedConditionalBuilder from './conditional/AdvancedConditionalBuilder';
import TimeBasedTriggerManager from './scheduling/TimeBasedTriggerManager';
import AutomationPermissions from './permissions/AutomationPermissions';
import AutomationAuditLog from './audit/AutomationAuditLog';
import { Input } from '@/components/ui/input';

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

interface AutomationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  automations: Automation[];
  onToggleAutomation: (id: string) => void;
  onCreateNew: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const AutomationTabs = ({ 
  activeTab, 
  onTabChange, 
  automations, 
  onToggleAutomation, 
  onCreateNew,
  searchTerm,
  onSearchTermChange
}: AutomationTabsProps) => {
  const [selectedAutomationId, setSelectedAutomationId] = React.useState<string | null>(null);

  const filteredAutomations = automations.filter(automation => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      automation.name.toLowerCase().includes(term) ||
      automation.trigger.toLowerCase().includes(term) ||
      automation.actions.some(action => action.toLowerCase().includes(term))
    );
  });

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="automations">Automations</TabsTrigger>
        <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Assistant
        </TabsTrigger>
        <TabsTrigger value="webhooks" className="flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          Webhooks
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
        <TabsTrigger value="conditional">Conditional</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="automations" className="space-y-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, trigger, or action..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <AutomationsList 
          automations={filteredAutomations}
          onToggleAutomation={onToggleAutomation}
          onCreateNew={onCreateNew}
        />
      </TabsContent>

      <TabsContent value="ai-assistant">
        <div className="text-center p-8">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-muted-foreground">AI-powered automation suggestions coming soon</p>
        </div>
      </TabsContent>

      <TabsContent value="webhooks">
        <div className="text-center p-8">
          <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Webhook Manager</h3>
          <p className="text-muted-foreground">Webhook management functionality coming soon</p>
        </div>
      </TabsContent>

      <TabsContent value="performance">
        <div className="text-center p-8">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Performance Monitor</h3>
          <p className="text-muted-foreground">Performance monitoring coming soon</p>
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

      <TabsContent value="analytics" className="space-y-4">
        <AutomationAnalytics automations={automations} />
      </TabsContent>
    </Tabs>
  );
};

export default AutomationTabs;
