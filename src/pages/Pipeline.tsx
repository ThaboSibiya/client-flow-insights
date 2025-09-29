
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Ticket, Zap, Settings, Database, Webhook } from "lucide-react";
import CustomerPipeline from '@/components/pipeline/CustomerPipeline';
import TicketPipeline from '@/components/pipeline/TicketPipeline';
import AutomationManager from '@/components/pipeline/AutomationManager';
import PipelineSettings from '@/components/pipeline/PipelineSettings';
import IntegrationAutomationsManager from '@/components/pipeline/automation/IntegrationAutomationsManager';
import WebhookWorkflowsManager from '@/components/pipeline/automation/WebhookWorkflowsManager';
import PipelineErrorBoundary from '@/components/error/PipelineErrorBoundary';

type TabValue = 'customers' | 'tickets' | 'integrations' | 'webhooks' | 'automations' | 'settings';

const Pipeline: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('customers');

  // Handle URL-based tab switching
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as TabValue;
    if (tabFromUrl && ['customers', 'tickets', 'integrations', 'webhooks', 'automations', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setActiveTab(newTab);
    
    // Update URL without the tab parameter for clean URLs
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tab');
    const newSearch = searchParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    navigate(newPath, { replace: true });
  };

  return (
    <PipelineErrorBoundary>
      <div className="space-y-6">
        <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Pipeline & Integrations
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Manage pipelines, integrations & automations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-6">
          <PipelineErrorBoundary>
            <CustomerPipeline />
          </PipelineErrorBoundary>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <PipelineErrorBoundary>
            <TicketPipeline />
          </PipelineErrorBoundary>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationAutomationsManager />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookWorkflowsManager />
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
          <AutomationManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <PipelineSettings />
        </TabsContent>
      </Tabs>
      </div>
    </PipelineErrorBoundary>
  );
};

export default Pipeline;
