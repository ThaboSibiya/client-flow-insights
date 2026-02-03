import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyActivityData } from '@/utils/chart-utils';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface StreamlinedChartProps {
  data: MonthlyActivityData[];
}

type PeriodOption = '7d' | '30d' | '90d';
type ViewOption = 'all' | 'new' | 'existing' | 'pending' | 'finalised';

const StreamlinedChart = ({ data }: StreamlinedChartProps) => {
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [view, setView] = useState<ViewOption>('all');

  const periodOptions: { value: PeriodOption; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
  ];

  const viewOptions: { value: ViewOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'existing', label: 'Existing' },
    { value: 'pending', label: 'Pending' },
    { value: 'finalised', label: 'Finalised' },
  ];

  // Filter data based on period (simplified for demo)
  const filteredData = data.slice(period === '7d' ? -2 : period === '30d' ? -6 : 0);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Activity Overview</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center bg-muted/50 rounded-md p-0.5">
              {periodOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs font-medium",
                    period === opt.value 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setPeriod(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {/* View Filter */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {viewOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs font-medium rounded-full",
                    view === opt.value 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setView(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                {(view === 'all' || view === 'new') && (
                  <Bar 
                    dataKey="new" 
                    stackId="a"
                    fill="hsl(var(--primary))" 
                    name="New" 
                    radius={[0, 0, 0, 0]} 
                  />
                )}
                {(view === 'all' || view === 'existing') && (
                  <Bar 
                    dataKey="existing" 
                    stackId="a"
                    fill="hsl(var(--chart-2))" 
                    name="Existing" 
                    radius={[0, 0, 0, 0]} 
                  />
                )}
                {(view === 'all' || view === 'pending') && (
                  <Bar 
                    dataKey="pending" 
                    stackId="a"
                    fill="hsl(var(--chart-4))" 
                    name="Pending" 
                    radius={[0, 0, 0, 0]} 
                  />
                )}
                {(view === 'all' || view === 'finalised') && (
                  <Bar 
                    dataKey="finalised" 
                    stackId="a"
                    fill="hsl(var(--chart-3))" 
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

export default StreamlinedChart;
