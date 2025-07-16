
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';
import { Clock, User, TrendingUp, FileText } from 'lucide-react';

interface RecentActivityProps {
  customers: Customer[];
}

const RecentActivity = ({ customers }: RecentActivityProps) => {
  const recentActivities = customers
    .filter(customer => customer.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)
    .map(customer => ({
      id: customer.id,
      type: 'status_change' as const,
      customer,
      timestamp: customer.updatedAt,
      description: `Customer ${customer.name} status updated to ${customer.status}`
    }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'new_customer': return <User className="h-4 w-4 text-green-500" />;
      case 'quote_sent': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'existing': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'finalised': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(activity.customer.status)}>
                      {activity.customer.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity in the last 7 days</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
