import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Database, FileBarChart, Settings2 } from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import DataCenter from '@/components/analytics/data-center/DataCenter';
import InteractiveReports from '@/components/analytics/InteractiveReports';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { AnalyticsProvider } from '@/context/AnalyticsContext';

const Analytics: React.FC = () => {
  return (
    <AnalyticsProvider>
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Minimalist Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Insights, reports, and data management
            </p>
          </div>
        </div>

        {/* Simplified Tab Structure */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <FileBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data Center</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <InteractiveReports />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <DataCenter />
          </TabsContent>
        </Tabs>
      </div>
    </AnalyticsProvider>
  );
};

export default Analytics;
