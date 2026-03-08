
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

  const riskColor = currentChurnRate > 4
    ? 'hsl(var(--chart-churn))'
    : currentChurnRate > 2
      ? 'hsl(var(--chart-pending))'
      : 'hsl(var(--chart-existing))';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserMinus className="h-4 w-4" style={{ color: 'hsl(var(--chart-churn))' }} />
            Churn & Retention
          </CardTitle>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--chart-churn))' }} />
              Current: {currentChurnRate.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--chart-retention))' }} />
              Avg: {avgChurnRate.toFixed(1)}%
            </span>
            <span className="font-medium" style={{ color: riskColor }}>
              {currentChurnRate > 4 ? 'High Risk' : currentChurnRate > 2 ? 'Medium' : 'Low Risk'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnData}>
              <defs>
                <linearGradient id="churnAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-churn))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--chart-churn))" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                stroke="hsl(var(--chart-churn))"
                strokeWidth={2.5}
                name="churnRate"
                dot={{ fill: 'hsl(var(--chart-churn))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="hsl(var(--chart-retention))"
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
            <p className="text-sm font-bold" style={{ color: 'hsl(var(--chart-churn))' }}>
              {churnData.reduce((s, d) => s + d.churned, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Retention</p>
            <p className="text-sm font-bold" style={{ color: 'hsl(var(--chart-retention))' }}>
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
