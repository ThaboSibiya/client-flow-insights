
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Users, BarChart3, UserMinus, MapPin } from 'lucide-react';
import CustomerLifecycleTracker from './CustomerLifecycleTracker';
import RevenueForecastChart from './RevenueForecastChart';
import TeamPerformanceMetrics from './TeamPerformanceMetrics';
import CustomerAcquisitionCost from './CustomerAcquisitionCost';
import ChurnRateAnalysis from './ChurnRateAnalysis';
import RegionalPerformance from './RegionalPerformance';

const AdvancedAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-green-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Advanced Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into customer lifecycle, revenue forecasting, team performance, and business intelligence
        </p>
      </div>

      <Tabs defaultValue="lifecycle" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="lifecycle" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            Lifecycle
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1 text-xs">
            <DollarSign className="h-3 w-3" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            Team
          </TabsTrigger>
          <TabsTrigger value="acquisition" className="flex items-center gap-1 text-xs">
            <BarChart3 className="h-3 w-3" />
            CAC
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-1 text-xs">
            <UserMinus className="h-3 w-3" />
            Churn
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            Regional
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

        <TabsContent value="acquisition" className="space-y-6">
          <CustomerAcquisitionCost />
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <ChurnRateAnalysis />
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <RegionalPerformance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
