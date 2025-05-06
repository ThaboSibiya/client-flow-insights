
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Customer } from '@/context/CRMContext';

interface MonthlyTrendsProps {
  customers: Customer[];
}

const MonthlyTrends = ({ customers }: MonthlyTrendsProps) => {
  // Generate monthly data for the past 6 months
  const generateMonthlyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Count customers created or updated in this month
      const newCount = customers.filter(c => 
        c.status === 'new' && 
        c.createdAt.getMonth() === month.getMonth() && 
        c.createdAt.getFullYear() === month.getFullYear()
      ).length;
      
      const finalisedCount = customers.filter(c => 
        c.status === 'finalised' && 
        c.updatedAt.getMonth() === month.getMonth() && 
        c.updatedAt.getFullYear() === month.getFullYear()
      ).length;
      
      data.push({
        name: monthName,
        new: newCount,
        finalised: finalisedCount,
      });
    }
    
    return data;
  };
  
  const monthlyData = generateMonthlyData();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="new" 
                stroke="#3182CE" 
                name="New Customers" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="finalised" 
                stroke="#48BB78" 
                name="Finalised Sales" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrends;
