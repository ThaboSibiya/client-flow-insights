
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonthlyActivityData } from '@/utils/chart-utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartProps {
  data: MonthlyActivityData[];
}

const CustomerActivityChart = ({ data }: ChartProps) => {
  const [viewOption, setViewOption] = useState<'all' | 'new' | 'existing' | 'pending' | 'finalised'>('all');
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Activity</CardTitle>
        <div className="flex gap-2">
          <Tabs defaultValue="stacked" onValueChange={(value) => setChartType(value as 'stacked' | 'grouped')}>
            <TabsList className="grid grid-cols-2 h-8 w-40">
              <TabsTrigger value="stacked">Stacked</TabsTrigger>
              <TabsTrigger value="grouped">Grouped</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select
            value={viewOption}
            onValueChange={(value) => setViewOption(value as 'all' | 'new' | 'existing' | 'pending' | 'finalised')}
          >
            <SelectTrigger className="w-[180px] bg-white border-broker-primary/20 shadow-sm h-8">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
                <SelectItem value="existing">Existing Customers</SelectItem>
                <SelectItem value="pending">Pending Sales</SelectItem>
                <SelectItem value="finalised">Finalised Sales</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            No customer data available
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182CE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3182CE" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38B2AC" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DD6B20" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DD6B20" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#48BB78" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
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
                  <Bar 
                    dataKey="new" 
                    stackId={chartType === 'stacked' ? 'a' : undefined}
                    fill="url(#colorNew)" 
                    name="New" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {(viewOption === 'all' || viewOption === 'existing') && (
                  <Bar 
                    dataKey="existing" 
                    stackId={chartType === 'stacked' ? 'a' : undefined}
                    fill="url(#colorExisting)" 
                    name="Existing" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {(viewOption === 'all' || viewOption === 'pending') && (
                  <Bar 
                    dataKey="pending" 
                    stackId={chartType === 'stacked' ? 'a' : undefined}
                    fill="url(#colorPending)" 
                    name="Pending" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {(viewOption === 'all' || viewOption === 'finalised') && (
                  <Bar 
                    dataKey="finalised" 
                    stackId={chartType === 'stacked' ? 'a' : undefined}
                    fill="url(#colorFinalised)" 
                    name="Finalised" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActivityChart;
