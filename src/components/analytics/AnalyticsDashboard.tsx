
import React, { useMemo } from 'react';
import { Users, Ticket, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import KPIWidget from './widgets/KPIWidget';
import ChartWidget from './widgets/ChartWidget';
import TableWidget from './widgets/TableWidget';
import ProgressWidget from './widgets/ProgressWidget';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AnalyticsDashboard: React.FC = () => {
  const { 
    isLoading, 
    error, 
    metrics, 
    customerTimeSeries, 
    revenueTimeSeries, 
    ticketTimeSeries,
    customerStatusData,
    activeDataset,
    importedDatasets
  } = useAnalytics();

  // Compute imported data analytics if an active dataset is selected
  const importedDataMetrics = useMemo(() => {
    if (!activeDataset) return null;
    
    const { data, columns } = activeDataset;
    
    // Auto-detect numeric columns for aggregation
    const numericColumns = columns.filter(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col]);
      return sampleValues.some(v => typeof v === 'number' || !isNaN(Number(v)));
    });
    
    // Calculate sums for numeric columns
    const sums: Record<string, number> = {};
    numericColumns.forEach(col => {
      sums[col] = data.reduce((sum, row) => {
        const val = Number(row[col]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    });
    
    // Find potential category columns (strings with limited unique values)
    const categoryColumns = columns.filter(col => {
      const uniqueValues = new Set(data.map(row => String(row[col])));
      return uniqueValues.size <= 20 && uniqueValues.size > 1;
    });
    
    // Generate distribution for first category column
    const distribution: { name: string; value: number }[] = [];
    if (categoryColumns.length > 0) {
      const catCol = categoryColumns[0];
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const key = String(row[catCol] ?? 'Unknown');
        counts[key] = (counts[key] || 0) + 1;
      });
      Object.entries(counts).forEach(([name, value]) => {
        distribution.push({ name, value });
      });
    }
    
    return {
      totalRows: data.length,
      numericColumns,
      sums,
      categoryColumns,
      distribution
    };
  }, [activeDataset]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Failed to load analytics</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use real metrics if available, otherwise show empty state
  const displayMetrics = metrics || {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    pendingCustomers: 0,
    finalisedCustomers: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    totalRevenue: 0,
    avgResponseTime: 0,
    customerGrowthRate: 0,
    ticketResolutionRate: 0
  };

  return (
    <div className="space-y-6">
      {/* Active Dataset Banner */}
      {activeDataset && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <Badge variant="default">Imported Data</Badge>
              <span className="font-medium">{activeDataset.name}</span>
              <span className="text-sm text-muted-foreground">
                {activeDataset.rowCount} rows • {activeDataset.columns.length} columns
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Row - Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          title="Total Customers"
          value={displayMetrics.totalCustomers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="default"
          trend={{ 
            value: displayMetrics.customerGrowthRate, 
            direction: displayMetrics.customerGrowthRate >= 0 ? 'up' : 'down', 
            label: 'vs last 30 days' 
          }}
        />
        <KPIWidget
          title="Active Customers"
          value={displayMetrics.activeCustomers.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="success"
        />
        <KPIWidget
          title="Total Tickets"
          value={displayMetrics.totalTickets.toLocaleString()}
          icon={<Ticket className="h-5 w-5" />}
          color="warning"
          trend={{ 
            value: displayMetrics.ticketResolutionRate, 
            direction: 'up', 
            label: 'resolution rate' 
          }}
        />
        <KPIWidget
          title="Total Revenue"
          value={`$${displayMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="default"
        />
      </div>

      {/* Charts Row - Real Data */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartWidget
          title="Customer Acquisition"
          subtitle="New customers over the past 6 months"
          data={customerTimeSeries.length > 0 ? customerTimeSeries : []}
          type="area"
          dataKey="value"
          height={220}
        />
        <ChartWidget
          title="Revenue Trend"
          subtitle="Monthly revenue from paid invoices"
          data={revenueTimeSeries.length > 0 ? revenueTimeSeries : []}
          type="bar"
          dataKey="value"
          height={220}
        />
      </div>

      {/* Imported Data Analysis */}
      {activeDataset && importedDataMetrics && (
        <div className="grid lg:grid-cols-2 gap-4">
          {importedDataMetrics.distribution.length > 0 && (
            <ChartWidget
              title="Data Distribution"
              subtitle={`Based on: ${activeDataset.columns[0] || 'category'}`}
              data={importedDataMetrics.distribution.slice(0, 10)}
              type="pie"
              dataKey="value"
              height={220}
            />
          )}
          {importedDataMetrics.numericColumns.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Numeric Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importedDataMetrics.numericColumns.slice(0, 5).map(col => (
                    <div key={col} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{col}</span>
                      <span className="font-medium">
                        {typeof importedDataMetrics.sums[col] === 'number'
                          ? importedDataMetrics.sums[col].toLocaleString(undefined, { maximumFractionDigits: 2 })
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartWidget
          title="Customer Status"
          subtitle="Distribution by status"
          data={customerStatusData.length > 0 ? customerStatusData : []}
          type="pie"
          dataKey="value"
          height={180}
        />
        <div className="lg:col-span-2">
          <ChartWidget
            title="Ticket Volume"
            subtitle="Support tickets over time"
            data={ticketTimeSeries.length > 0 ? ticketTimeSeries : []}
            type="line"
            dataKey="value"
            height={180}
          />
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ProgressWidget
          title="Ticket Resolution"
          value={displayMetrics.resolvedTickets}
          max={displayMetrics.totalTickets || 1}
          subtitle={`${displayMetrics.resolvedTickets} of ${displayMetrics.totalTickets} tickets resolved`}
          color="success"
        />
        <ProgressWidget
          title="Customer Conversion"
          value={displayMetrics.finalisedCustomers}
          max={displayMetrics.totalCustomers || 1}
          subtitle="New to finalised conversion"
          color="default"
        />
        <ProgressWidget
          title="Active Rate"
          value={displayMetrics.activeCustomers}
          max={displayMetrics.totalCustomers || 1}
          subtitle="Percentage of active customers"
          color="warning"
        />
      </div>

      {/* Empty State for imported datasets suggestion */}
      {importedDatasets.length === 0 && displayMetrics.totalCustomers === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No data available yet</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Add customers to see analytics, or import external data via the Data Center tab to analyze your own datasets.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
