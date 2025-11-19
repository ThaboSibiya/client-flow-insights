
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Webhook } from "lucide-react";
import IntegrationAutomationsManager from '@/components/pipeline/automation/IntegrationAutomationsManager';
import WebhookWorkflowsManager from '@/components/pipeline/automation/WebhookWorkflowsManager';

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Integrations & Webhooks
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Connect external systems and manage webhook workflows
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-2">
          <TabsTrigger value="integrations" className="flex items-center gap-2 flex-1 md:flex-initial">
            <Database className="h-4 w-4" />
            <span className="whitespace-nowrap">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2 flex-1 md:flex-initial">
            <Webhook className="h-4 w-4" />
            <span className="whitespace-nowrap">Webhooks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationAutomationsManager />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookWorkflowsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
