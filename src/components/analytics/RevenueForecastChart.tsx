
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';

const RevenueForecastChart = () => {
  const { revenueTimeSeries, isLoading } = useAnalytics();

  const chartData = useMemo(() => {
    if (!revenueTimeSeries.length) return [];

    // Calculate standard deviation for confidence bands
    const values = revenueTimeSeries.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);

    const pastData = revenueTimeSeries.map(item => ({
      month: item.name,
      actual: item.value,
      forecast: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));

    const avgGrowth = values.length >= 2
      ? (values[values.length - 1] - values[0]) / (values.length - 1)
      : 0;
    const lastValue = values[values.length - 1] || 0;

    const futureMonths = ['Next +1', 'Next +2', 'Next +3'];
    const futureData = futureMonths.map((month, i) => {
      const predicted = Math.max(0, Math.round(lastValue + avgGrowth * (i + 1)));
      const spread = stdDev * (1 + i * 0.4); // Wider bands further out
      return {
        month,
        actual: null as number | null,
        forecast: predicted,
        upper: Math.round(predicted + spread),
        lower: Math.max(0, Math.round(predicted - spread)),
      };
    });

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
          <DollarSign className="h-4 w-4" style={{ color: 'hsl(var(--chart-revenue))' }} />
          Revenue Forecast
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(var(--chart-revenue))' }} />
            Actual: R{totalActual.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(var(--chart-forecast))' }} />
            Forecast: R{totalForecast.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm opacity-30" style={{ background: 'hsl(var(--chart-forecast))' }} />
            Confidence Band
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-revenue))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-revenue))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="revForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-forecast))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--chart-forecast))" stopOpacity={0.02} />
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
              <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--chart-forecast))" fillOpacity={0.08} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
              <Area type="monotone" dataKey="forecast" stroke="hsl(var(--chart-forecast))" strokeDasharray="5 5" fill="url(#revForecastGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-revenue))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--chart-revenue))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueForecastChart;
