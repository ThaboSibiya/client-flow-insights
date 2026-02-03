import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Clock, CircleCheck, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricProps {
  label: string;
  value: number;
  trend?: number;
  icon: React.ReactNode;
  sparklineData?: number[];
}

const MiniSparkline = ({ data }: { data: number[] }) => {
  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  
  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const MetricItem = ({ label, value, trend, icon, sparklineData }: MetricProps) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-r border-border/50 last:border-r-0">
      <div className="p-2 rounded-lg bg-muted/50">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">{value}</span>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive && "text-chart-2",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-muted-foreground"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{isPositive ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="ml-auto hidden lg:block">
          <MiniSparkline data={sparklineData} />
        </div>
      )}
    </div>
  );
};

interface CompactMetricsBarProps {
  newCustomers: number;
  existingCustomers: number;
  pendingCustomers: number;
  finalisedCustomers: number;
}

const CompactMetricsBar = ({
  newCustomers,
  existingCustomers,
  pendingCustomers,
  finalisedCustomers
}: CompactMetricsBarProps) => {
  // Generate mock sparkline data (would come from real data in production)
  const generateSparkline = (base: number) => {
    return Array.from({ length: 7 }, (_, i) => 
      Math.max(0, base + Math.floor(Math.random() * 10) - 5 + i)
    );
  };

  const metrics: MetricProps[] = [
    {
      label: 'New',
      value: newCustomers,
      trend: 12,
      icon: <Users className="h-4 w-4 text-primary" />,
      sparklineData: generateSparkline(newCustomers)
    },
    {
      label: 'Existing',
      value: existingCustomers,
      trend: 5,
      icon: <Database className="h-4 w-4 text-chart-2" />,
      sparklineData: generateSparkline(existingCustomers)
    },
    {
      label: 'Pending',
      value: pendingCustomers,
      trend: -3,
      icon: <Clock className="h-4 w-4 text-chart-4" />,
      sparklineData: generateSparkline(pendingCustomers)
    },
    {
      label: 'Finalised',
      value: finalisedCustomers,
      trend: 8,
      icon: <CircleCheck className="h-4 w-4 text-chart-3" />,
      sparklineData: generateSparkline(finalisedCustomers)
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-wrap lg:flex-nowrap">
        {metrics.map((metric) => (
          <MetricItem key={metric.label} {...metric} />
        ))}
      </div>
    </Card>
  );
};

export default CompactMetricsBar;
