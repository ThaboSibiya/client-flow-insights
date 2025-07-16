
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerChart from '@/components/analytics/CustomerChart';
import CustomerMetricsSummary from '@/components/analytics/CustomerMetricsSummary';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';
import TicketAnalyticsDashboard from '@/components/analytics/TicketAnalyticsDashboard';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import InteractiveReports from '@/components/analytics/InteractiveReports';
import ExecutiveSummaryCards from '@/components/analytics/ExecutiveSummaryCards';
import MobileAnalyticsView from '@/components/analytics/MobileAnalyticsView';
import ReportScheduler from '@/components/analytics/ReportScheduler';
import VoiceQueryInterface from '@/components/analytics/VoiceQueryInterface';
import { Users, Ticket, TrendingUp, FileBarChart, Calendar, Mic } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { generateReportData, calculateSummary } from '@/utils/customer-analytics';

const Analytics = () => {
  const { customers } = useCRM();
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  
  // Generate analytics data from customer data
  const reportData = generateReportData(customers, timeframe);
  const summary = calculateSummary(reportData);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-8 rounded-xl mb-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm quikle-card">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-quikle drop-shadow-sm">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your customer management and ticket performance
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards - Always Visible */}
      <ExecutiveSummaryCards />

      {/* Mobile Analytics View - Mobile Only */}
      <MobileAnalyticsView />

      {/* Desktop Tabs - Hidden on Mobile */}
      <div className="hidden md:block">
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Report Scheduler
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Queries
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

          <TabsContent value="scheduler" className="space-y-6">
            <ReportScheduler />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceQueryInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
