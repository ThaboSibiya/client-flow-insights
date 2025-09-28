
import React, { useMemo } from 'react';
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

const CustomerChart: React.FC<CustomerChartProps> = ({ reportData, timeframe }) => {
  const barSize = useMemo(() => timeframe === 'yearly' ? 30 : 15, [timeframe]);
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={reportData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <ChartDefinitions />
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis yAxisId="left" stroke="#6B7280" />
          <YAxis yAxisId="right" orientation="right" stroke="#1F2937" domain={[0, 100]} unit="%" />
          
          <Tooltip content={<ChartTooltipFormatter />} />
          
          <Legend 
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px'
            }}
            formatter={(value: string | number) => <ChartLegendFormatter value={value} />}
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
            stroke="#1F2937"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 7, stroke: '#1F2937', strokeWidth: 2 }}
            name="conversionRate"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerChart;
