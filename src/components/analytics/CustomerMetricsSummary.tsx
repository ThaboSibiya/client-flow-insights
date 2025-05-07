
import React from 'react';
import { ReportSummary } from '@/utils/customer-analytics';

interface CustomerMetricsSummaryProps {
  summary: ReportSummary;
}

const CustomerMetricsSummary = ({ summary }: CustomerMetricsSummaryProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 px-6 pt-4 text-center">
      <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <p className="text-xs text-gray-600">New Customers</p>
        <p className="text-xl font-bold text-broker-primary">{summary.totalNew}</p>
      </div>
      <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <p className="text-xs text-gray-600">Sales Completed</p>
        <p className="text-xl font-bold text-green-600">{summary.totalFinalised}</p>
      </div>
      <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <p className="text-xs text-gray-600">Conversion Rate</p>
        <p className="text-xl font-bold text-purple-600">{summary.overallConversion}%</p>
      </div>
    </div>
  );
};

export default CustomerMetricsSummary;
