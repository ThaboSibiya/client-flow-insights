
import React from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';

const Analytics = () => {
  const { customers } = useCRM();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visualize your business performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusDistribution customers={customers} />
        <WeeklySummary customers={customers} />
      </div>
      
      <div>
        <MonthlyTrends customers={customers} />
      </div>
    </div>
  );
};

export default Analytics;
