
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, Webhook } from "lucide-react";
import AutomationsList from './AutomationsList';
import AutomationAnalytics from './AutomationAnalytics';
import AIAssistant from '../AIAssistant';
import WebhookManager from '../WebhookManager';
import PerformanceMonitor from '../PerformanceMonitor';

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
}

const AutomationTabs = ({ 
  activeTab, 
  onTabChange, 
  automations, 
  onToggleAutomation, 
  onCreateNew 
}: AutomationTabsProps) => {
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
        <AutomationsList 
          automations={automations}
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
