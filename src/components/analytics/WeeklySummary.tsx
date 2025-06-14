
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Customer } from '@/context/CRMContext';
import { ChartBarIcon } from 'lucide-react';

interface WeeklySummaryProps {
  customers: Customer[];
}

const WeeklySummary = ({ customers }: WeeklySummaryProps) => {
  // Generate weekly data for last 7 days
  const generateWeeklyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      
      const dayName = day.toLocaleDateString('default', { weekday: 'short' });
      const dayDate = day.getDate();
      
      // Filter customers created or with status changed on this day
      const acquisitions = customers.filter(c => 
        c.status === 'new' && 
        c.createdAt.toDateString() === day.toDateString()
      ).length;
      
      const sales = customers.filter(c => 
        c.status === 'finalised' && 
        c.updatedAt.toDateString() === day.toDateString()
      ).length;

      // Estimate revenue (for visual purposes)
      const estimatedRevenue = sales * 1500; // Assuming average sale value of $1500
      
      data.push({
        name: `${dayName} ${dayDate}`,
        acquisitions,
        sales,
        revenue: estimatedRevenue
      });
    }
    
    return data;
  };
  
  const weeklyData = generateWeeklyData();

  return (
    <Card className="shadow-lg border border-white/30 bg-gradient-to-br from-white via-white to-gray-50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b border-gray-100 pb-2">
        <CardTitle className="flex items-center gap-2 text-gradient">
          <ChartBarIcon className="h-5 w-5 text-quikle-accent" />
          Weekly Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorAcquisitions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#4A5568" />
              <YAxis stroke="#4A5568" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0' 
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') {
                    return [`$${value.toLocaleString()}`, 'Revenue'];
                  }
                  return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                }}
              />
              <Legend />
              <Bar 
                dataKey="acquisitions" 
                name="Customer Acquisitions" 
                fill="url(#colorAcquisitions)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="sales" 
                name="Sales Volume" 
                fill="url(#colorSales)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;
