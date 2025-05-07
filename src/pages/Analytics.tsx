
import React from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusDistribution from '@/components/analytics/StatusDistribution';
import MonthlyTrends from '@/components/analytics/MonthlyTrends';
import WeeklySummary from '@/components/analytics/WeeklySummary';
import { ChartPieIcon, ChartLineIcon } from 'lucide-react';

const Analytics = () => {
  const { customers } = useCRM();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/30 via-broker-secondary/20 to-broker-accent/30 p-8 rounded-xl mb-6 shadow-xl border border-white/30 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visualize your business performance metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-1 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <StatusDistribution customers={customers} />
        </div>
        <div className="bg-white p-1 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <WeeklySummary customers={customers} />
        </div>
      </div>
      
      <div className="bg-white p-1 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <MonthlyTrends customers={customers} />
      </div>
      
      <div className="text-xs text-gray-400 text-center mt-4">
        Data updated as of {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default Analytics;
