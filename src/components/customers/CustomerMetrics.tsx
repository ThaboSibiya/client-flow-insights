
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerMetricsProps {
  customers: Customer[];
}

const CustomerMetrics = ({ customers }: CustomerMetricsProps) => {
  const metrics = {
    total: customers.length,
    new: customers.filter(c => c.status === 'new').length,
    existing: customers.filter(c => c.status === 'existing').length,
    pending: customers.filter(c => c.status === 'pending').length,
    finalised: customers.filter(c => c.status === 'finalised').length,
    withTickets: customers.filter(c => c.ticketCount > 0).length,
    urgentTickets: customers.filter(c => 
      c.activeTickets?.some(ticket => ticket.priority === 'urgent' && ticket.status !== 'closed')
    ).length,
    recentlyAdded: customers.filter(c => {
      const daysSinceCreated = (new Date().getTime() - c.createdAt.getTime()) / (1000 * 3600 * 24);
      return daysSinceCreated <= 7;
    }).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'existing': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-quikle-crystal text-quikle-slate border border-quikle-silver';
      case 'finalised': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <div className="flex gap-1 mt-2 flex-wrap">
            <Badge className={getStatusColor('new')} variant="secondary">
              {metrics.new} New
            </Badge>
            <Badge className={getStatusColor('existing')} variant="secondary">
              {metrics.existing} Existing
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pending + metrics.finalised}</div>
          <div className="flex gap-1 mt-2 flex-wrap">
            <Badge className={getStatusColor('pending')} variant="secondary">
              {metrics.pending} Pending
            </Badge>
            <Badge className={getStatusColor('finalised')} variant="secondary">
              {metrics.finalised} Finalised
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Support Activity</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.withTickets}</div>
          <div className="flex gap-1 mt-2 flex-wrap">
            <Badge className="bg-red-100 text-red-800" variant="secondary">
              {metrics.urgentTickets} Urgent
            </Badge>
            <Badge className="bg-gray-100 text-gray-800" variant="secondary">
              {metrics.withTickets} Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.recentlyAdded}</div>
          <p className="text-xs text-muted-foreground mt-2">
            New customers this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMetrics;
