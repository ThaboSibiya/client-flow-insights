
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Zap, ListChecks } from "lucide-react";
import PipelineSettings from '@/components/pipeline/PipelineSettings';
import AutomationManager from '@/components/pipeline/AutomationManager';
import TasksManager from '@/components/agents/TasksManager';

const Pipeline = () => {
  const [activeTab, setActiveTab] = useState('automations');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">
          AI Agents
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your tasks and automations with intelligent agents.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="mt-6">
          <AutomationManager />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TasksManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <PipelineSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pipeline;
