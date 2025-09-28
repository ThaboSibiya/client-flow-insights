
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, Calendar, Settings, BarChart3 } from 'lucide-react';
import DrillDownAnalytics from './DrillDownAnalytics';
import ExportScheduler from './ExportScheduler';
import CustomReportBuilder from './CustomReportBuilder';

const InteractiveReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-indigo-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Interactive Reports
        </h2>
        <p className="text-muted-foreground mt-1">
          Advanced reporting with drill-down capabilities, automated exports, and custom report building
        </p>
      </div>

      <Tabs defaultValue="drill-down" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drill-down" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Drill-Down Analytics
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Export Scheduler
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drill-down" className="space-y-6">
          <DrillDownAnalytics />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportScheduler />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CustomReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveReports;
