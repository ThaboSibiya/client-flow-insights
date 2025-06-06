
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRM } from '@/context/CRMContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const InteractiveMetrics = () => {
  const { customers } = useCRM();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Calculate metrics based on customer data
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const activeTickets = customers.reduce((total, customer) => 
    total + (customer.activeTickets?.length || 0), 0);
  const resolvedTickets = customers.reduce((total, customer) => 
    total + (customer.activeTickets?.filter(t => t.status === 'resolved').length || 0), 0);

  // Calculate growth trends (mock data for demonstration)
  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const metrics = [
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: totalCustomers,
      previousValue: Math.max(0, totalCustomers - 3),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'new-customers',
      title: 'New Customers',
      value: newCustomers,
      previousValue: Math.max(0, newCustomers - 1),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'active-tickets',
      title: 'Active Tickets',
      value: activeTickets,
      previousValue: Math.max(0, activeTickets + 2),
      icon: <Ticket className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'resolved-tickets',
      title: 'Resolved Tickets',
      value: resolvedTickets,
      previousValue: Math.max(0, resolvedTickets - 1),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    }
  ];

  const timeFrames = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];

  return (
    <Card className="shadow-md bg-gradient-to-br from-white to-gray-50 border-gray-200/70">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-broker-primary">
            <TrendingUp className="h-5 w-5 text-broker-accent" />
            Performance Metrics
          </CardTitle>
          <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <TabsList className="h-8">
              {timeFrames.map((timeFrame) => (
                <TabsTrigger key={timeFrame.id} value={timeFrame.id} className="text-xs px-3">
                  {timeFrame.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const growth = getGrowthPercentage(metric.value, metric.previousValue);
            const isPositive = growth > 0;
            const isNegative = growth < 0;
            
            return (
              <div
                key={metric.id}
                className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                  {growth !== 0 && (
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={`text-xs ${
                        isPositive 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(growth)}%
                    </Badge>
                  )}
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {metric.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    vs. previous {selectedPeriod}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last updated:</span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMetrics;
