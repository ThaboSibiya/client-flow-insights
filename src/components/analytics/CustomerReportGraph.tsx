
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/context/CRMContext';
import { ChartPieIcon } from 'lucide-react';
import CustomerChart from './CustomerChart';
import CustomerMetricsSummary from './CustomerMetricsSummary';
import TimeframeSelector from './TimeframeSelector';
import { generateReportData, calculateSummary } from '@/utils/customer-analytics';

interface CustomerReportGraphProps {
  customers: Customer[];
}

const CustomerReportGraph = ({ customers }: CustomerReportGraphProps) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  
  const reportData = generateReportData(customers, timeframe);
  const summary = calculateSummary(reportData);

  return (
    <Card className="shadow-lg border border-white/30 bg-gradient-to-br from-white via-white to-gray-50 transform hover:scale-[1.01] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent">
          <ChartPieIcon className="h-5 w-5 text-broker-primary" />
          Customer Conversion Report
        </CardTitle>
        <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
      </CardHeader>
      
      <CustomerMetricsSummary summary={summary} />
      
      <CardContent className="pt-2">
        <CustomerChart reportData={reportData} timeframe={timeframe} />
      </CardContent>
      <div className="text-xs text-gray-400 text-center pb-2">
        Conversion Rate = (Finalised Sales ÷ New Customers) × 100%
      </div>
    </Card>
  );
};

export default CustomerReportGraph;
