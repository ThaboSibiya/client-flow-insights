
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Ticket, Zap, Settings } from "lucide-react";
import CustomerPipeline from '@/components/pipeline/CustomerPipeline';
import TicketPipeline from '@/components/pipeline/TicketPipeline';
import AutomationManager from '@/components/pipeline/AutomationManager';
import PipelineSettings from '@/components/pipeline/PipelineSettings';

const Pipeline = () => {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="space-y-6">
      <div className="sophisticated-gradient p-8 rounded-xl mb-6 shadow-lg border border-quikle-silver/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">
          Pipeline
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your customer and ticket pipelines, automations, and settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Tickets
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
          <CustomerPipeline />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <TicketPipeline />
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
          <AutomationManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <PipelineSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pipeline;
