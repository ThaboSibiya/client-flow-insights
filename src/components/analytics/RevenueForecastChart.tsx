
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const RevenueForecastChart = () => {
  const { customers } = useCRM();

  // Generate mock revenue data based on customer progression
  const generateRevenueData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short' });
      
      // Calculate actual revenue based on finalized customers
      const monthCustomers = customers.filter(customer => {
        const customerMonth = new Date(customer.updated_at).getMonth();
        const customerYear = new Date(customer.updated_at).getFullYear();
        return customerMonth === date.getMonth() && 
               customerYear === date.getFullYear() && 
               customer.status === 'finalised';
      }).length;
      
      const baseRevenue = monthCustomers * 2500; // Assume R2500 average deal size
      
      months.push({
        month: monthName,
        actual: baseRevenue,
        forecast: baseRevenue * 1.2, // 20% growth forecast
        target: baseRevenue * 1.3, // 30% growth target
      });
    }
    
    // Add future forecasted months
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short' });
      const lastRevenue = months[months.length - 1]?.forecast || 10000;
      
      months.push({
        month: monthName,
        actual: null,
        forecast: lastRevenue * (1 + (i * 0.05)), // 5% monthly growth
        target: lastRevenue * (1 + (i * 0.08)), // 8% target growth
      });
    }
    
    return months;
  };

  const revenueData = generateRevenueData();
  const currentRevenue = revenueData.slice(0, 6).reduce((sum, month) => sum + (month.actual || 0), 0);
  const forecastedRevenue = revenueData.slice(6).reduce((sum, month) => sum + month.forecast, 0);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-quikle-accent" />
          Revenue Forecast
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-quikle-primary rounded"></div>
            <span>Actual: R{currentRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-quikle-accent rounded"></div>
            <span>Forecast: R{forecastedRevenue.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value, name) => [
                  value ? `R${value.toLocaleString()}` : 'N/A', 
                  name === 'actual' ? 'Actual' : name === 'forecast' ? 'Forecast' : 'Target'
                ]}
              />
              <Area type="monotone" dataKey="target" stackId="1" stroke="#64748B" fill="url(#targetGradient)" />
              <Area type="monotone" dataKey="forecast" stackId="1" stroke="#6B7280" fill="url(#forecastGradient)" />
              <Line type="monotone" dataKey="actual" stroke="#1F2937" strokeWidth={3} dot={{ fill: '#1F2937' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueForecastChart;
