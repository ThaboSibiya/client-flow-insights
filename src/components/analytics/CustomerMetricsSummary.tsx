
import React from 'react';
import { ReportSummary } from '@/utils/customer-analytics';

interface CustomerMetricsSummaryProps {
  summary: ReportSummary;
}

const CustomerMetricsSummary = ({ summary }: CustomerMetricsSummaryProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 px-6 pt-4 text-center">
      <div className="p-2 bg-gradient-to-br from-quikle-crystal to-quikle-platinum rounded-lg border border-quikle-primary/20">
        <p className="text-xs text-quikle-slate">New Customers</p>
        <p className="text-xl font-bold text-quikle-primary">{summary.totalNew}</p>
      </div>
      <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
        <p className="text-xs text-emerald-600">Sales Completed</p>
        <p className="text-xl font-bold text-emerald-700">{summary.totalFinalised}</p>
      </div>
      <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
        <p className="text-xs text-purple-600">Conversion Rate</p>
        <p className="text-xl font-bold text-purple-700">{summary.overallConversion}%</p>
      </div>
    </div>
  );
};

export default CustomerMetricsSummary;
