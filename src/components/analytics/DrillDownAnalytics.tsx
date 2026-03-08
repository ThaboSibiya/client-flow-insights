
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronDown, ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';

type MetricType = 'customers' | 'revenue' | 'tickets';

interface DrillPath {
  level: string;
  filter: string;
  data: any[];
}

const DrillDownAnalytics = () => {
  const { metrics, customerTimeSeries, revenueTimeSeries, ticketTimeSeries, customerStatusData, isLoading } = useAnalytics();
  const [activeMetric, setActiveMetric] = useState<MetricType>('customers');
  const [drillPath, setDrillPath] = useState<DrillPath[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'overview' | 'monthly'>('overview');

  const overviewData = useMemo(() => {
    if (!metrics) return [];

    switch (activeMetric) {
      case 'customers':
        return [
          { name: 'New', value: metrics.newCustomers },
          { name: 'Active', value: metrics.activeCustomers },
          { name: 'Pending', value: metrics.pendingCustomers },
          { name: 'Finalised', value: metrics.finalisedCustomers },
        ];
      case 'revenue':
        return revenueTimeSeries.map(d => ({ name: d.name, value: d.value }));
      case 'tickets':
        return [
          { name: 'Open', value: metrics.openTickets },
          { name: 'Resolved', value: metrics.resolvedTickets },
          { name: 'Total', value: metrics.totalTickets },
        ];
      default:
        return [];
    }
  }, [metrics, activeMetric, revenueTimeSeries]);

  const [currentData, setCurrentData] = useState<any[]>([]);
  const displayData = currentLevel === 'overview' ? overviewData : currentData;

  const handleDrillDown = (data: any) => {
    if (currentLevel === 'overview' && activeMetric === 'customers') {
      // Drill into monthly breakdown from customer time series
      const monthlyData = customerTimeSeries.map(d => ({ name: d.name, value: d.value }));
      setDrillPath([{ level: 'Status', filter: data.name, data: overviewData }]);
      setCurrentData(monthlyData);
      setCurrentLevel('monthly');
    }
  };

  const handleDrillUp = () => {
    if (drillPath.length > 0) {
      setDrillPath([]);
      setCurrentLevel('overview');
    }
  };

  const metricTabs: { key: MetricType; label: string }[] = [
    { key: 'customers', label: 'Customers' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'tickets', label: 'Tickets' },
  ];

  const handleMetricSwitch = (metric: MetricType) => {
    setActiveMetric(metric);
    setDrillPath([]);
    setCurrentLevel('overview');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {drillPath.length === 0 ? 'Drill-Down Analytics' : `Drill: ${drillPath.map(p => p.filter).join(' > ')}`}
          </CardTitle>
          {drillPath.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDrillUp}>
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-1.5 mt-2">
          {metricTabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeMetric === tab.key ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleMetricSwitch(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {drillPath.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            {drillPath.map((path, i) => (
              <React.Fragment key={i}>
                <Badge variant="secondary" className="text-[10px]">{path.filter}</Badge>
                {i < drillPath.length - 1 && <ChevronRight className="h-3 w-3" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {currentLevel === 'monthly' ? (
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            ) : (
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={activeMetric === 'revenue' ? (v) => `R${(v/1000).toFixed(0)}k` : undefined}
                />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }}
                  formatter={(value: number) => [
                    activeMetric === 'revenue' ? `R${value.toLocaleString()}` : value,
                    activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)
                  ]}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  cursor={activeMetric === 'customers' && currentLevel === 'overview' ? 'pointer' : undefined}
                  onClick={activeMetric === 'customers' && currentLevel === 'overview' ? handleDrillDown : undefined}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {currentLevel === 'overview' && activeMetric === 'customers' && (
          <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
            <ChevronDown className="h-3 w-3" />
            Click bars to drill into monthly trends
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DrillDownAnalytics;
