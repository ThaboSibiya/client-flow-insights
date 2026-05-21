
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Calendar, Settings } from 'lucide-react';
import DrillDownAnalytics from './DrillDownAnalytics';
import UnifiedScheduler from './UnifiedScheduler';
import CustomReportBuilder from './CustomReportBuilder';

const InteractiveReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Drill-down analytics, scheduled exports, and custom report building
        </p>
      </div>

      <Tabs defaultValue="drill-down" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 h-auto">
          <TabsTrigger value="drill-down" className="gap-2 data-[state=active]:bg-background data-[state=active]:!text-foreground data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Drill-Down
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="gap-2 data-[state=active]:bg-background data-[state=active]:!text-foreground data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-2 data-[state=active]:bg-background data-[state=active]:!text-foreground data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drill-down" className="space-y-6">
          <DrillDownAnalytics />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <UnifiedScheduler />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CustomReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveReports;
