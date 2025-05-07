
import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { ReportData } from '@/utils/customer-analytics';

interface CustomerChartProps {
  reportData: ReportData[];
  timeframe: 'monthly' | 'yearly';
}

const CustomerChart = ({ reportData, timeframe }: CustomerChartProps) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={reportData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D946EF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#D946EF" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis yAxisId="left" stroke="#6B7280" />
          <YAxis yAxisId="right" orientation="right" stroke="#D946EF" domain={[0, 100]} unit="%" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(229, 231, 235, 0.5)'
            }}
            formatter={(value, name) => {
              if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px'
            }}
            formatter={(value) => {
              // Fix the TypeScript error - ensure value is a string before using string methods
              if (value === 'conversionRate') return 'Conversion Rate';
              if (typeof value === 'string') {
                return value.charAt(0).toUpperCase() + value.slice(1);
              }
              return value;
            }}
          />
          <Bar yAxisId="left" dataKey="new" fill="url(#colorNew)" name="new" barSize={timeframe === 'yearly' ? 30 : 15} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="existing" fill="url(#colorExisting)" name="existing" barSize={timeframe === 'yearly' ? 30 : 15} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="pending" fill="url(#colorPending)" name="pending" barSize={timeframe === 'yearly' ? 30 : 15} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="finalised" fill="url(#colorFinalised)" name="finalised" barSize={timeframe === 'yearly' ? 30 : 15} radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversionRate"
            stroke="#D946EF"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: '#D946EF', strokeWidth: 2 }}
            name="conversionRate"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerChart;
