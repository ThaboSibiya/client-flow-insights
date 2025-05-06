
import React from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';

const Analytics = () => {
  const { customers } = useCRM();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
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
