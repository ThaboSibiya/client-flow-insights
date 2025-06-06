
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerChart from '@/components/analytics/CustomerChart';
import CustomerMetricsSummary from '@/components/analytics/CustomerMetricsSummary';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';
import TicketAnalyticsDashboard from '@/components/analytics/TicketAnalyticsDashboard';
import { Users, Ticket } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your customer management and ticket performance
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Analytics
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Ticket Analytics
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
      </Tabs>
    </div>
  );
};

export default Analytics;
