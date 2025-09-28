import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerChart from '@/components/analytics/CustomerChart';
import CustomerMetricsSummary from '@/components/analytics/CustomerMetricsSummary';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';
import TicketAnalyticsDashboard from '@/components/analytics/TicketAnalyticsDashboard';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import InteractiveReports from '@/components/analytics/InteractiveReports';
import { Users, Ticket, TrendingUp, FileBarChart } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { generateReportData, calculateSummary, type ReportData, type ReportSummary } from '@/utils/customer-analytics';
interface AnalyticsProps {}

const Analytics: React.FC<AnalyticsProps> = () => {
  const { customers } = useCRM();
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  // Generate analytics data from customer data with memoization
  const reportData: ReportData[] = useMemo(() => 
    generateReportData(customers, timeframe), 
    [customers, timeframe]
  );
  
  const summary: ReportSummary = useMemo(() => 
    calculateSummary(reportData), 
    [reportData]
  );
  return <div className="space-y-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-1.5">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
              Analytics & Reports
            </h1>
            <p className="text-quikle-charcoal/70 font-medium">
              Comprehensive insights into customer & ticket performance
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Analytics
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Ticket Analytics
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Interactive Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <CustomerMetricsSummary summary={summary} />
          <div className="grid gap-6 md:grid-cols-2">
            <CustomerChart reportData={reportData} timeframe={timeframe} />
            <StatusDistribution customers={customers} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <MonthlyTrends customers={customers} />
            <WeeklySummary customers={customers} />
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <TicketAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <InteractiveReports />
        </TabsContent>
      </Tabs>
    </div>;
};
export default Analytics;