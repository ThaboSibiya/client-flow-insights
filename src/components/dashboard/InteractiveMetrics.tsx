
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
      icon: <Users className="h-4 w-4" />,
      color: 'text-quikle-primary',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'new-customers',
      title: 'New Customers',
      value: newCustomers,
      previousValue: Math.max(0, newCustomers - 1),
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'active-tickets',
      title: 'Active Tickets',
      value: activeTickets,
      previousValue: Math.max(0, activeTickets + 2),
      icon: <Ticket className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'resolved-tickets',
      title: 'Resolved Tickets',
      value: resolvedTickets,
      previousValue: Math.max(0, resolvedTickets - 1),
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    }
  ];

  const timeFrames = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' }
  ];

  return (
    <Card className="shadow-md quikle-card h-fit">
      <CardHeader className="pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gradient-quikle text-base">
            <TrendingUp className="h-4 w-4 text-quikle-accent" />
            Performance Metrics
          </CardTitle>
          <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <TabsList className="h-7">
              {timeFrames.map((timeFrame) => (
                <TabsTrigger key={timeFrame.id} value={timeFrame.id} className="text-xs px-2 py-1">
                  {timeFrame.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-3 px-4">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const growth = getGrowthPercentage(metric.value, metric.previousValue);
            const isPositive = growth > 0;
            const isNegative = growth < 0;
            
            return (
              <div
                key={metric.id}
                className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${metric.bgColor}`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                  {growth !== 0 && (
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={`text-xs px-1.5 py-0.5 ${
                        isPositive 
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100" 
                          : "bg-red-100 text-red-700 border-red-300 hover:bg-red-100"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="h-2.5 w-2.5 mr-1" /> : <TrendingDown className="h-2.5 w-2.5 mr-1" />}
                      {Math.abs(growth)}%
                    </Badge>
                  )}
                </div>
                
                <div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {metric.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs. previous {selectedPeriod}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Last updated:</span>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMetrics;
