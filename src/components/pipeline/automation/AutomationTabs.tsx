
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, Webhook, Search } from "lucide-react";
import AutomationsList from './AutomationsList';
import AutomationAnalytics from './AutomationAnalytics';
import AIAssistant from '../AIAssistant';
import WebhookManager from '../WebhookManager';
import PerformanceMonitor from '../PerformanceMonitor';
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
      <TabsList>
        <TabsTrigger value="automations">Automations</TabsTrigger>
        <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Assistant
        </TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance
        </TabsTrigger>
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
        <AIAssistant />
      </TabsContent>

      <TabsContent value="webhooks">
        <WebhookManager />
      </TabsContent>

      <TabsContent value="performance">
        <PerformanceMonitor />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <AutomationAnalytics automations={automations} />
      </TabsContent>
    </Tabs>
  );
};

export default AutomationTabs;
