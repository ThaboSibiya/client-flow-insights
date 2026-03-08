
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';

const CustomerAcquisitionCost = () => {
  const { customerTimeSeries, revenueTimeSeries, isLoading } = useAnalytics();

  const cacData = useMemo(() => {
    if (!customerTimeSeries.length) return [];

    return customerTimeSeries.map((month, i) => {
      const revenue = revenueTimeSeries[i]?.value ?? 0;
      // CAC = estimated spend (% of revenue) / new customers
      const estimatedSpend = revenue * 0.25; // 25% of revenue as marketing spend estimate
      const cac = month.value > 0 ? Math.round(estimatedSpend / month.value) : 0;

      return {
        month: month.name,
        cac,
        newCustomers: month.value,
        spend: Math.round(estimatedSpend),
      };
    });
  }, [customerTimeSeries, revenueTimeSeries]);

  const averageCAC = cacData.length > 0
    ? Math.round(cacData.reduce((sum, d) => sum + d.cac, 0) / cacData.filter(d => d.cac > 0).length || 0)
    : 0;

  const trend = cacData.length >= 2
    ? cacData[cacData.length - 1]?.cac > cacData[cacData.length - 2]?.cac ? 'up' : 'down'
    : 'stable';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Loading CAC data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Customer Acquisition Cost
        </CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Avg CAC: R{averageCAC}</span>
          {trend === 'up' ? (
            <span className="flex items-center gap-1 text-destructive">
              <TrendingUp className="h-3 w-3" /> Rising
            </span>
          ) : (
            <span className="flex items-center gap-1 text-primary">
              <TrendingDown className="h-3 w-3" /> Improving
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cacData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tickFormatter={(v) => `R${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number, name: string) => [
                  name === 'cac' ? `R${value}` : value,
                  name === 'cac' ? 'CAC' : 'New Customers'
                ]}
              />
              <Bar dataKey="cac" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="text-sm font-bold text-foreground">
              R{cacData.reduce((sum, d) => sum + d.spend, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">New Customers</p>
            <p className="text-sm font-bold text-foreground">
              {cacData.reduce((sum, d) => sum + d.newCustomers, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p className={`text-sm font-bold ${trend === 'down' ? 'text-primary' : 'text-destructive'}`}>
              {trend === 'down' ? '↓ Improving' : '↑ Rising'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAcquisitionCost;
