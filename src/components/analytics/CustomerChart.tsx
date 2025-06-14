
import React from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { ReportData } from '@/utils/customer-analytics';
import ChartDefinitions from './ChartDefinitions';
import ChartTooltipFormatter from './ChartTooltipFormatter';
import ChartLegendFormatter from './ChartLegendFormatter';
import ChartBar from './ChartBar';

interface CustomerChartProps {
  reportData: ReportData[];
  timeframe: 'monthly' | 'yearly';
}

const CustomerChart = ({ reportData, timeframe }: CustomerChartProps) => {
  const barSize = timeframe === 'yearly' ? 30 : 15;
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={reportData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E67E22" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#E67E22" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2C3E50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2C3E50" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F39C12" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F39C12" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#27AE60" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9B59B6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis yAxisId="left" stroke="#6B7280" />
          <YAxis yAxisId="right" orientation="right" stroke="#9B59B6" domain={[0, 100]} unit="%" />
          
          <Tooltip content={<ChartTooltipFormatter />} />
          
          <Legend 
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px'
            }}
            formatter={(value) => <ChartLegendFormatter value={value} />}
          />
          
          <ChartBar 
            yAxisId="left" 
            dataKey="new" 
            fill="url(#colorNew)" 
            name="new" 
            barSize={barSize}
          />
          
          <ChartBar 
            yAxisId="left" 
            dataKey="existing" 
            fill="url(#colorExisting)" 
            name="existing" 
            barSize={barSize}
          />
          
          <ChartBar 
            yAxisId="left" 
            dataKey="pending" 
            fill="url(#colorPending)" 
            name="pending" 
            barSize={barSize}
          />
          
          <ChartBar 
            yAxisId="left" 
            dataKey="finalised" 
            fill="url(#colorFinalised)" 
            name="finalised" 
            barSize={barSize}
          />
          
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversionRate"
            stroke="#9B59B6"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: '#9B59B6', strokeWidth: 2 }}
            name="conversionRate"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerChart;
