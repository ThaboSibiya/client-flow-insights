
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ResolutionTimeMetrics } from '@/services/ticketAnalyticsService';

interface TicketResolutionMetricsProps {
  metrics: ResolutionTimeMetrics;
  isLoading?: boolean;
}

const TicketResolutionMetrics = ({ metrics, isLoading }: TicketResolutionMetricsProps) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const priorityData = [
    { priority: 'Urgent', time: metrics.resolutionTimeByPriority.urgent, color: '#DC2626' },
    { priority: 'High', time: metrics.resolutionTimeByPriority.high, color: '#EA580C' },
    { priority: 'Medium', time: metrics.resolutionTimeByPriority.medium, color: '#0369A1' },
    { priority: 'Low', time: metrics.resolutionTimeByPriority.low, color: '#16A34A' },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.averageResolutionTime)}</div>
            <p className="text-xs text-muted-foreground">
              Median: {formatTime(metrics.medianResolutionTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fastest Priority</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(metrics.resolutionTimeByPriority)
                .filter(([_, time]) => time > 0)
                .sort(([_, a], [__, b]) => a - b)[0]?.[0]?.charAt(0).toUpperCase() + 
               Object.entries(metrics.resolutionTimeByPriority)
                .filter(([_, time]) => time > 0)
                .sort(([_, a], [__, b]) => a - b)[0]?.[0]?.slice(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatTime(
                Object.entries(metrics.resolutionTimeByPriority)
                  .filter(([_, time]) => time > 0)
                  .sort(([_, a], [__, b]) => a - b)[0]?.[1] || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.resolutionTrend.length > 1 ? (
                metrics.resolutionTrend[metrics.resolutionTrend.length - 1].averageTime < 
                metrics.resolutionTrend[metrics.resolutionTrend.length - 2].averageTime ? (
                  <Badge variant="outline" className="text-green-600">Improving</Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600">Declining</Badge>
                )
              ) : (
                <Badge variant="outline" className="text-gray-600">No Trend</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recent data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time by Priority</CardTitle>
            <CardDescription>Average time to resolve tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis tickFormatter={(value) => formatTime(value)} />
                <Tooltip formatter={(value: number) => formatTime(value)} />
                <Bar dataKey="time" fill="#0369A1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Trend</CardTitle>
            <CardDescription>Average resolution time over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.resolutionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatTime(value)} />
                <Tooltip formatter={(value: number) => formatTime(value)} />
                <Line type="monotone" dataKey="averageTime" stroke="#0369A1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketResolutionMetrics;
