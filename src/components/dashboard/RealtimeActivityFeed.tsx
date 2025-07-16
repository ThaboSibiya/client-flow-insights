
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, TrendingUp } from 'lucide-react';
import { Customer } from '@/types/customer';

interface ActivityItem {
  id: string;
  type: 'customer_added' | 'status_changed' | 'quote_sent' | 'payment_received';
  customer?: Customer;
  timestamp: Date;
  description: string;
}

interface RealtimeActivityFeedProps {
  activities?: ActivityItem[];
  customers?: Customer[];
}

const RealtimeActivityFeed = ({ activities = [], customers = [] }: RealtimeActivityFeedProps) => {
  // Generate sample activities from customers
  const sampleActivities: ActivityItem[] = customers.slice(0, 5).map((customer, index) => ({
    id: `activity-${index}`,
    type: index % 2 === 0 ? 'customer_added' : 'status_changed',
    customer,
    timestamp: customer.updatedAt,
    description: index % 2 === 0 
      ? `New customer ${customer.name} was added`
      : `Customer ${customer.name} status changed to ${customer.status}`
  }));

  const displayActivities = activities.length > 0 ? activities : sampleActivities;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added': return <User className="h-4 w-4 text-blue-500" />;
      case 'status_changed': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'quote_sent': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'payment_received': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added': return 'bg-blue-100 text-blue-800';
      case 'status_changed': return 'bg-green-100 text-green-800';
      case 'quote_sent': return 'bg-purple-100 text-purple-800';
      case 'payment_received': return 'bg-emerald-100 text-emerald-800';
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
          {displayActivities.length > 0 ? (
            displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
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
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeActivityFeed;
