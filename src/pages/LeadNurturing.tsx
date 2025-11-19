
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, TrendingUp, Settings } from 'lucide-react';
import CustomerAutoAssignment from '@/components/customers/enhanced/CustomerAutoAssignment';
import FollowUpScheduler from '@/components/customers/enhanced/FollowUpScheduler';

const LeadNurturing = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 via-green-500/15 to-purple-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
          Lead Nurturing Automation
        </h1>
        <p className="text-muted-foreground mt-1">
          Automate lead assignment, follow-ups, and status progression to maximize conversion rates
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assignment" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-4">
          <TabsTrigger value="assignment" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Auto-</span>Assignment
          </TabsTrigger>
          <TabsTrigger value="followup" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <Calendar className="h-4 w-4" />
            Follow-up
          </TabsTrigger>
          <TabsTrigger value="progression" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Status </span>Alerts
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Task </span>Creation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignment" className="space-y-6">
          <CustomerAutoAssignment />
        </TabsContent>

        <TabsContent value="followup" className="space-y-6">
          <FollowUpScheduler />
        </TabsContent>

        <TabsContent value="progression" className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Status Progression Alerts</h3>
            <p className="text-muted-foreground">
              Configure automated alerts and actions when customers change status.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Automatic Task Creation</h3>
            <p className="text-muted-foreground">
              Set up rules for automatically creating tasks based on customer actions.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadNurturing;
