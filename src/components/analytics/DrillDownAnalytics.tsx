
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

const METRIC_COLORS: Record<MetricType, string> = {
  customers: 'hsl(var(--chart-new))',
  revenue: 'hsl(var(--chart-revenue))',
  tickets: 'hsl(var(--chart-pending))',
};

const DrillDownAnalytics = () => {
  const { metrics, customerTimeSeries, revenueTimeSeries, ticketTimeSeries, isLoading } = useAnalytics();
  const [activeMetric, setActiveMetric] = useState<MetricType>('customers');
  const [drillPath, setDrillPath] = useState<DrillPath[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'overview' | 'monthly'>('overview');

  const overviewData = useMemo(() => {
    if (!metrics) return [];

    switch (activeMetric) {
      case 'customers':
        return [
          { name: 'New', value: metrics.newCustomers, fill: 'hsl(var(--chart-new))' },
          { name: 'Active', value: metrics.activeCustomers, fill: 'hsl(var(--chart-existing))' },
          { name: 'Pending', value: metrics.pendingCustomers, fill: 'hsl(var(--chart-pending))' },
          { name: 'Finalised', value: metrics.finalisedCustomers, fill: 'hsl(var(--chart-finalised))' },
        ];
      case 'revenue':
        return revenueTimeSeries.map(d => ({ name: d.name, value: d.value, fill: 'hsl(var(--chart-revenue))' }));
      case 'tickets':
        return [
          { name: 'Open', value: metrics.openTickets, fill: 'hsl(var(--chart-pending))' },
          { name: 'Resolved', value: metrics.resolvedTickets, fill: 'hsl(var(--chart-existing))' },
          { name: 'Total', value: metrics.totalTickets, fill: 'hsl(var(--chart-new))' },
        ];
      default:
        return [];
    }
  }, [metrics, activeMetric, revenueTimeSeries]);

  const [currentData, setCurrentData] = useState<any[]>([]);
  const displayData = currentLevel === 'overview' ? overviewData : currentData;

  const handleDrillDown = (data: any) => {
    if (currentLevel === 'overview' && activeMetric === 'customers') {
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

  const activeColor = METRIC_COLORS[activeMetric];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: activeColor }} />
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
                <Line type="monotone" dataKey="value" stroke={activeColor} strokeWidth={2.5} dot={{ r: 4, fill: activeColor, strokeWidth: 2, stroke: 'hsl(var(--background))' }} />
              </LineChart>
            ) : (
              <BarChart data={displayData}>
                <defs>
                  {activeMetric === 'customers' ? (
                    <>
                      <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-new))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-new))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="gradExisting" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-existing))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-existing))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-pending))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-pending))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="gradFinalised" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-finalised))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-finalised))" stopOpacity={0.6} />
                      </linearGradient>
                    </>
                  ) : (
                    <linearGradient id="gradDefault" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeColor} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={activeColor} stopOpacity={0.5} />
                    </linearGradient>
                  )}
                </defs>
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
                {activeMetric === 'customers' ? (
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={handleDrillDown}
                    shape={(props: any) => {
                      const { x, y, width, height, index } = props;
                      const gradIds = ['gradNew', 'gradExisting', 'gradPending', 'gradFinalised'];
                      return <rect x={x} y={y} width={width} height={height} fill={`url(#${gradIds[index] || 'gradNew'})`} rx={6} ry={6} />;
                    }}
                  />
                ) : (
                  <Bar dataKey="value" fill="url(#gradDefault)" radius={[6, 6, 0, 0]} />
                )}
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
