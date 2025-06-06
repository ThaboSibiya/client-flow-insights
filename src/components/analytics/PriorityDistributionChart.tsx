
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PriorityDistribution } from '@/services/ticketAnalyticsService';

interface PriorityDistributionChartProps {
  distribution: PriorityDistribution;
  isLoading?: boolean;
}

const PriorityDistributionChart = ({ distribution, isLoading }: PriorityDistributionChartProps) => {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  const pieData = [
    { name: 'Urgent', value: distribution.urgent, color: '#ef4444' },
    { name: 'High', value: distribution.high, color: '#f97316' },
    { name: 'Medium', value: distribution.medium, color: '#eab308' },
    { name: 'Low', value: distribution.low, color: '#22c55e' },
  ].filter(item => item.value > 0);

  const barData = [
    { priority: 'Urgent', count: distribution.urgent, percentage: total > 0 ? (distribution.urgent / total) * 100 : 0 },
    { priority: 'High', count: distribution.high, percentage: total > 0 ? (distribution.high / total) * 100 : 0 },
    { priority: 'Medium', count: distribution.medium, percentage: total > 0 ? (distribution.medium / total) * 100 : 0 },
    { priority: 'Low', count: distribution.low, percentage: total > 0 ? (distribution.low / total) * 100 : 0 },
  ];

  const getHighestPriority = () => {
    const priorities = [
      { name: 'urgent', count: distribution.urgent },
      { name: 'high', count: distribution.high },
      { name: 'medium', count: distribution.medium },
      { name: 'low', count: distribution.low },
    ];
    return priorities.reduce((max, current) => current.count > max.count ? current : max);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Across all priorities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{distribution.urgent}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? Math.round((distribution.urgent / total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Badge variant="outline" className="text-xs">
              {getHighestPriority().name.charAt(0).toUpperCase() + getHighestPriority().name.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getHighestPriority().count}</div>
            <p className="text-xs text-muted-foreground">tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{distribution.low}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? Math.round((distribution.low / total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Ticket distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, `${name} Priority`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Detailed count and percentage by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} tickets` : `${(value as number).toFixed(1)}%`,
                    name === 'count' ? 'Count' : 'Percentage'
                  ]}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriorityDistributionChart;
