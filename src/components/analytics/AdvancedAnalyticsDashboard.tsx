
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import CustomerLifecycleTracker from './CustomerLifecycleTracker';
import RevenueForecastChart from './RevenueForecastChart';
import TeamPerformanceMetrics from './TeamPerformanceMetrics';

const AdvancedAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-green-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Advanced Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into customer lifecycle, revenue forecasting, and team performance
        </p>
      </div>

      <Tabs defaultValue="lifecycle" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lifecycle" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Customer Lifecycle
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Forecast
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-6">
          <CustomerLifecycleTracker />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueForecastChart />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamPerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
