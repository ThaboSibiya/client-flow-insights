
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Calendar, Package, Bell } from "lucide-react";
import JobCompletionNotifications from './coordination/JobCompletionNotifications';
import AutoStatusUpdates from './coordination/AutoStatusUpdates';
import NextAppointmentScheduler from './coordination/NextAppointmentScheduler';
import InventoryAlerts from './coordination/InventoryAlerts';

const OnSiteCoordinationManager = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/10 via-quikle-accent/8 to-quikle-secondary/10 p-6 rounded-xl border border-quikle-silver/20">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="h-6 w-6 text-quikle-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            On-Site Team Coordination
          </h1>
        </div>
        <p className="text-quikle-slate text-sm">
          Automate communication between mobile teams and office operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-quikle-silver/20 shadow-sm">
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Job Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="status-updates" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Status Updates
          </TabsTrigger>
          <TabsTrigger 
            value="scheduling" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger 
            value="inventory" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <JobCompletionNotifications />
        </TabsContent>

        <TabsContent value="status-updates" className="mt-6">
          <AutoStatusUpdates />
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6">
          <NextAppointmentScheduler />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnSiteCoordinationManager;
