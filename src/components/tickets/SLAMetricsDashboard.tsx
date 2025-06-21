
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, Timer } from 'lucide-react';
import { useSLAManagement } from '@/hooks/useSLAManagement';

const SLAMetricsDashboard = () => {
  const { slaMetrics, loadSLAMetrics, isLoading } = useSLAManagement();
  const [timeRange, setTimeRange] = useState('7days');

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    
    let start: Date;
    const end = new Date();
    
    switch (value) {
      case '24hours':
        start = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    loadSLAMetrics({ start, end });
  };

  const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (!slaMetrics) {
    return <div className="text-center p-4">Loading SLA metrics...</div>;
  }

  const responseSLAPercentage = calculatePercentage(slaMetrics.responseSLAMet, slaMetrics.totalTickets);
  const resolutionSLAPercentage = calculatePercentage(slaMetrics.resolutionSLAMet, slaMetrics.totalTickets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SLA Performance Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">24 Hours</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => loadSLAMetrics()} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{responseSLAPercentage}%</p>
              <p className="text-xs text-muted-foreground">Response SLA Met</p>
              <p className="text-xs text-gray-500">{slaMetrics.responseSLAMet} / {slaMetrics.totalTickets}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Timer className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{resolutionSLAPercentage}%</p>
              <p className="text-xs text-muted-foreground">Resolution SLA Met</p>
              <p className="text-xs text-gray-500">{slaMetrics.resolutionSLAMet} / {slaMetrics.totalTickets}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{slaMetrics.atRiskTickets}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
              <p className="text-xs text-gray-500">SLA warnings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-600">{slaMetrics.breachedTickets}</p>
              <p className="text-xs text-muted-foreground">Breached</p>
              <p className="text-xs text-gray-500">SLA violations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Average Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatMinutesToHours(slaMetrics.averageResponseTime)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Time from ticket creation to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatMinutesToHours(slaMetrics.averageResolutionTime)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Time from ticket creation to resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Targets */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Targets by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['urgent', 'high', 'medium', 'low'].map(priority => {
              const config = {
                urgent: { responseHours: 1, resolutionHours: 4, color: 'border-red-200 bg-red-50' },
                high: { responseHours: 4, resolutionHours: 24, color: 'border-orange-200 bg-orange-50' },
                medium: { responseHours: 8, resolutionHours: 72, color: 'border-blue-200 bg-blue-50' },
                low: { responseHours: 24, resolutionHours: 168, color: 'border-green-200 bg-green-50' }
              }[priority];

              return (
                <div key={priority} className={`p-3 rounded-lg border ${config?.color}`}>
                  <Badge variant="outline" className="mb-2 capitalize">
                    {priority}
                  </Badge>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Response:</span> {config?.responseHours}h
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Resolution:</span> {config?.resolutionHours}h
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SLAMetricsDashboard;
