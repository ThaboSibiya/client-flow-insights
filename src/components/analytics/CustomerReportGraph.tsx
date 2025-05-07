
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Customer } from '@/context/CRMContext';
import { 
  ChartPieIcon, 
  CalendarIcon 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerReportGraphProps {
  customers: Customer[];
}

const CustomerReportGraph = ({ customers }: CustomerReportGraphProps) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  
  // Generate monthly or yearly data
  const generateReportData = () => {
    const data = [];
    const today = new Date();
    
    if (timeframe === 'monthly') {
      // Generate data for the past 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = month.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        // Count customers by status for this month
        const newCustomers = customers.filter(c => 
          c.status === 'new' && 
          c.createdAt.getMonth() === month.getMonth() && 
          c.createdAt.getFullYear() === month.getFullYear()
        ).length;
        
        const existingCustomers = customers.filter(c => 
          c.status === 'existing' && 
          c.updatedAt.getMonth() === month.getMonth() && 
          c.updatedAt.getFullYear() === month.getFullYear()
        ).length;
        
        const pendingCustomers = customers.filter(c => 
          c.status === 'pending' && 
          c.updatedAt.getMonth() === month.getMonth() && 
          c.updatedAt.getFullYear() === month.getFullYear()
        ).length;
        
        const finalisedCustomers = customers.filter(c => 
          c.status === 'finalised' && 
          c.updatedAt.getMonth() === month.getMonth() && 
          c.updatedAt.getFullYear() === month.getFullYear()
        ).length;
        
        // Calculate conversion rate (finalised / new) * 100, or 0 if no new customers
        const conversionRate = newCustomers > 0 
          ? Math.round((finalisedCustomers / newCustomers) * 100) 
          : 0;
        
        data.push({
          name: monthName,
          new: newCustomers,
          existing: existingCustomers,
          pending: pendingCustomers,
          finalised: finalisedCustomers,
          conversionRate: conversionRate
        });
      }
    } else {
      // Generate data for the past 5 years
      for (let i = 4; i >= 0; i--) {
        const year = today.getFullYear() - i;
        
        // Count customers by status for this year
        const newCustomers = customers.filter(c => 
          c.status === 'new' && 
          c.createdAt.getFullYear() === year
        ).length;
        
        const existingCustomers = customers.filter(c => 
          c.status === 'existing' && 
          c.updatedAt.getFullYear() === year
        ).length;
        
        const pendingCustomers = customers.filter(c => 
          c.status === 'pending' && 
          c.updatedAt.getFullYear() === year
        ).length;
        
        const finalisedCustomers = customers.filter(c => 
          c.status === 'finalised' && 
          c.updatedAt.getFullYear() === year
        ).length;
        
        // Calculate conversion rate
        const conversionRate = newCustomers > 0 
          ? Math.round((finalisedCustomers / newCustomers) * 100) 
          : 0;
        
        data.push({
          name: year.toString(),
          new: newCustomers,
          existing: existingCustomers,
          pending: pendingCustomers,
          finalised: finalisedCustomers,
          conversionRate: conversionRate
        });
      }
    }
    
    return data;
  };
  
  const reportData = generateReportData();

  // Calculate summary metrics
  const calculateSummary = () => {
    const totalNew = reportData.reduce((sum, item) => sum + item.new, 0);
    const totalFinalised = reportData.reduce((sum, item) => sum + item.finalised, 0);
    const overallConversion = totalNew > 0 
      ? Math.round((totalFinalised / totalNew) * 100) 
      : 0;
    
    return {
      totalNew,
      totalFinalised,
      overallConversion
    };
  };
  
  const summary = calculateSummary();

  return (
    <Card className="shadow-lg border border-white/30 bg-gradient-to-br from-white via-white to-gray-50 transform hover:scale-[1.01] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent">
          <ChartPieIcon className="h-5 w-5 text-broker-primary" />
          Customer Conversion Report
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{timeframe === 'monthly' ? 'Monthly' : 'Yearly'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTimeframe('monthly')}>
                Monthly
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeframe('yearly')}>
                Yearly
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
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
      
      <CardContent className="pt-2">
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
      </CardContent>
      <div className="text-xs text-gray-400 text-center pb-2">
        Conversion Rate = (Finalised Sales ÷ New Customers) × 100%
      </div>
    </Card>
  );
};

export default CustomerReportGraph;
