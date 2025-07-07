
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Ticket, DollarSign, Clock } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const ExecutiveSummaryCards = () => {
  const { customers } = useCRM();

  // Calculate key metrics
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const finalisedCustomers = customers.filter(c => c.status === 'finalised').length;
  const conversionRate = totalCustomers > 0 ? Math.round((finalisedCustomers / totalCustomers) * 100) : 0;
  
  // Calculate trends (mock data for demonstration)
  const customerGrowth = 12; // +12% from last month
  const revenueGrowth = 8; // +8% from last month
  const responseTime = 2.4; // hours average
  const ticketResolution = 94; // 94% within SLA

  const summaryCards = [
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      change: customerGrowth,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: 5,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Revenue Growth',
      value: `+${revenueGrowth}%`,
      change: revenueGrowth,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Avg Response Time',
      value: `${responseTime}h`,
      change: -15, // -15% improvement
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Ticket Resolution',
      value: `${ticketResolution}%`,
      change: 3,
      icon: <Ticket className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} ${card.color} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1">
                {card.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={card.change > 0 ? "default" : "destructive"} className="text-xs">
                  {card.change > 0 ? '+' : ''}{card.change}%
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExecutiveSummaryCards;
