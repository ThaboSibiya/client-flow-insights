
import React from 'react';
import CustomerLifecycleTracker from './CustomerLifecycleTracker';
import RevenueForecastChart from './RevenueForecastChart';
import ChurnRateAnalysis from './ChurnRateAnalysis';
import CustomerAcquisitionCost from './CustomerAcquisitionCost';
import PredictiveInsightsPanel from './PredictiveInsightsPanel';

const AdvancedAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Advanced Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Predictive insights, lifecycle tracking, and retention analysis
        </p>
      </div>

      {/* Section 1: AI Predictive Insights */}
      <PredictiveInsightsPanel />

      {/* Section 2: Lifecycle Pipeline */}
      <CustomerLifecycleTracker />

      {/* Section 3: Revenue & Forecast */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueForecastChart />
        <CustomerAcquisitionCost />
      </div>

      {/* Section 4: Churn & Retention */}
      <ChurnRateAnalysis />
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
