
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserMinus } from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';

const ChurnRateAnalysis: React.FC = () => {
  const { customerTimeSeries, metrics, isLoading } = useAnalytics();

  const churnData = useMemo(() => {
    if (!customerTimeSeries.length || !metrics) return [];

    let runningTotal = Math.max(metrics.totalCustomers - customerTimeSeries.reduce((s, d) => s + d.value, 0), 0);

    return customerTimeSeries.map((month) => {
      runningTotal += month.value;
      // Estimate churn as finalised customers proportional to total
      const estimatedChurn = runningTotal > 0
        ? Math.round((metrics.finalisedCustomers / metrics.totalCustomers) * month.value)
        : 0;
      const churnRate = runningTotal > 0 ? ((estimatedChurn / runningTotal) * 100) : 0;

      return {
        month: month.name,
        churnRate: Math.round(churnRate * 100) / 100,
        retentionRate: Math.round((100 - churnRate) * 100) / 100,
        churned: estimatedChurn,
        total: runningTotal,
      };
    });
  }, [customerTimeSeries, metrics]);

  const currentChurnRate = churnData[churnData.length - 1]?.churnRate ?? 0;
  const avgChurnRate = churnData.length > 0
    ? Math.round((churnData.reduce((s, d) => s + d.churnRate, 0) / churnData.length) * 100) / 100
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Loading churn data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserMinus className="h-4 w-4 text-destructive" />
            Churn & Retention
          </CardTitle>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Current: {currentChurnRate.toFixed(1)}%</span>
            <span>Avg: {avgChurnRate.toFixed(1)}%</span>
            <span className={`font-medium ${currentChurnRate > 4 ? 'text-destructive' : currentChurnRate > 2 ? 'text-amber-500' : 'text-primary'}`}>
              {currentChurnRate > 4 ? 'High Risk' : currentChurnRate > 2 ? 'Medium' : 'Low Risk'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'churnRate' ? 'Churn Rate' : 'Retention Rate'
                ]}
              />
              <Line
                type="monotone"
                dataKey="churnRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="churnRate"
                dot={{ fill: 'hsl(var(--destructive))', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                name="retentionRate"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Churned</p>
            <p className="text-sm font-bold text-destructive">
              {churnData.reduce((s, d) => s + d.churned, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Retention</p>
            <p className="text-sm font-bold text-primary">
              {(100 - avgChurnRate).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Customers</p>
            <p className="text-sm font-bold text-foreground">
              {metrics?.totalCustomers ?? 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ChurnRateAnalysis);
