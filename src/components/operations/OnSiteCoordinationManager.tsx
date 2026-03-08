import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Bell, Ticket, RefreshCw } from "lucide-react";
import JobCompletionNotifications from './coordination/JobCompletionNotifications';
import AutoStatusUpdates from './coordination/AutoStatusUpdates';
import OnSiteTicketManager from './coordination/OnSiteTicketManager';

const OnSiteCoordinationManager = () => {
  const [activeTab, setActiveTab] = useState('tickets');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-5 rounded-xl border border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <Truck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            On-Site Coordination
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage tickets, track completions, and view status changes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border border-border">
          <TabsTrigger 
            value="tickets" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 text-xs"
          >
            <Ticket className="h-3.5 w-3.5" />
            Tickets
          </TabsTrigger>
          <TabsTrigger 
            value="completions" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 text-xs"
          >
            <Bell className="h-3.5 w-3.5" />
            Completions
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          <OnSiteTicketManager />
        </TabsContent>

        <TabsContent value="completions" className="mt-4">
          <JobCompletionNotifications />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <AutoStatusUpdates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnSiteCoordinationManager;
