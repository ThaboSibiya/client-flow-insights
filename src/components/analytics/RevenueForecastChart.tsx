
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';

const RevenueForecastChart = () => {
  const { revenueTimeSeries, isLoading } = useAnalytics();

  const chartData = useMemo(() => {
    if (!revenueTimeSeries.length) return [];

    // Use real revenue data for past months
    const pastData = revenueTimeSeries.map(item => ({
      month: item.name,
      actual: item.value,
      forecast: null as number | null,
    }));

    // Simple linear forecast for next 3 months based on trend
    const values = revenueTimeSeries.map(d => d.value);
    const avgGrowth = values.length >= 2
      ? (values[values.length - 1] - values[0]) / (values.length - 1)
      : 0;
    const lastValue = values[values.length - 1] || 0;

    const futureMonths = ['Next +1', 'Next +2', 'Next +3'];
    const futureData = futureMonths.map((month, i) => ({
      month,
      actual: null as number | null,
      forecast: Math.max(0, Math.round(lastValue + avgGrowth * (i + 1))),
    }));

    return [...pastData, ...futureData];
  }, [revenueTimeSeries]);

  const totalActual = revenueTimeSeries.reduce((sum, d) => sum + d.value, 0);
  const totalForecast = chartData
    .filter(d => d.forecast !== null)
    .reduce((sum, d) => sum + (d.forecast ?? 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Loading revenue data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Revenue Forecast
        </CardTitle>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Actual: R{totalActual.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Forecast: R{totalForecast.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number | null, name: string) => [
                  value != null ? `R${value.toLocaleString()}` : 'N/A',
                  name === 'actual' ? 'Actual' : 'Forecast'
                ]}
              />
              <Area type="monotone" dataKey="forecast" stroke="hsl(var(--accent-foreground))" strokeDasharray="5 5" fill="url(#revForecastGrad)" />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueForecastChart;
