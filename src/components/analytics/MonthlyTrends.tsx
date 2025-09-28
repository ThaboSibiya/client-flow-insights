
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Customer } from '@/context/CRMContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthlyTrendsProps {
  customers: Customer[];
}

interface MonthlyData {
  name: string;
  new: number;
  finalised: number;
}

type ViewOption = 'all' | 'new' | 'finalised';

const MonthlyTrends: React.FC<MonthlyTrendsProps> = ({ customers }) => {
  const [viewOption, setViewOption] = useState<ViewOption>('all');
  
  // Generate monthly data for the past 6 months with memoization
  const monthlyData: MonthlyData[] = useMemo(() => {
    const data: MonthlyData[] = [];
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
  }, [customers]);

  const handleViewChange = useCallback((value: string) => {
    setViewOption(value as ViewOption);
  }, []);

  return (
    <Card className="shadow-lg border border-white/30 bg-gradient-to-br from-white via-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gradient">Monthly Trends</CardTitle>
        <Select
          value={viewOption}
          onValueChange={handleViewChange}
        >
          <SelectTrigger className="w-[180px] bg-white border-quikle-primary/20 shadow-sm">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="new">New Customers</SelectItem>
              <SelectItem value="finalised">Sales</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80 p-4">
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
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.2}/>
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
              />
              <Legend />
              {(viewOption === 'all' || viewOption === 'new') && (
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  stroke="#1E40AF" 
                  strokeWidth={3}
                  fill="url(#colorNew)"
                  name="New Customers" 
                  activeDot={{ r: 8, fill: '#1E40AF', stroke: '#1E40AF', strokeWidth: 1 }} 
                />
              )}
              {(viewOption === 'all' || viewOption === 'finalised') && (
                <Line 
                  type="monotone" 
                  dataKey="finalised" 
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  fill="url(#colorFinalised)"
                  name="Finalised Sales" 
                  activeDot={{ r: 8, fill: '#7C3AED', stroke: '#7C3AED', strokeWidth: 1 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrends;
