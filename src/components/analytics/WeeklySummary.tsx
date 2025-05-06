
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Customer } from '@/context/CRMContext';

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
      const dailyNew = customers.filter(c => 
        c.status === 'new' && 
        c.createdAt.toDateString() === day.toDateString()
      ).length;
      
      const dailyFinalised = customers.filter(c => 
        c.status === 'finalised' && 
        c.updatedAt.toDateString() === day.toDateString()
      ).length;
      
      data.push({
        name: `${dayName} ${dayDate}`,
        new: dailyNew,
        finalised: dailyFinalised,
      });
    }
    
    return data;
  };
  
  const weeklyData = generateWeeklyData();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="new" fill="#3182CE" name="New Onboarding" />
              <Bar dataKey="finalised" fill="#48BB78" name="Finalised Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;
