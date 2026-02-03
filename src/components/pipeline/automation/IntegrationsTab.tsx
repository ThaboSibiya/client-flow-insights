import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Webhook, Plug } from 'lucide-react';
import WebhookManager from '../WebhookManager';

const IntegrationsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('webhooks');

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            API Triggers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="mt-4">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">API Triggers</h3>
            <p className="text-sm">
              Configure API endpoints that trigger your workflows
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsTab;
