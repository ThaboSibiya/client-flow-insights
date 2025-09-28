import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CheckCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'customer_added' | 'ticket_resolved' | 'quote_sent';
  description: string;
  timestamp: Date;
  user: string;
}

const RecentActivity: React.FC = () => {
  // Mock data - in real app this would come from props or API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'customer_added',
      description: 'New customer John Doe added',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      user: 'Admin',
    },
    {
      id: '2',
      type: 'ticket_resolved',
      description: 'Support ticket #1234 resolved',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      user: 'Sarah Johnson',
    },
    {
      id: '3',
      type: 'quote_sent',
      description: 'Quote sent to ABC Corp',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: 'Mike Smith',
    },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added':
        return <User className="h-4 w-4 text-blue-600" aria-hidden="true" />;
      case 'ticket_resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />;
      case 'quote_sent':
        return <Clock className="h-4 w-4 text-purple-600" aria-hidden="true" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" aria-hidden="true" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added':
        return <Badge variant="secondary">Customer</Badge>;
      case 'ticket_resolved':
        return <Badge variant="default">Ticket</Badge>;
      case 'quote_sent':
        return <Badge variant="outline">Quote</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No recent activity
        </p>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className="border-l-4 border-l-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {getActivityBadge(activity.type)}
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>by {activity.user}</span>
                    <span>•</span>
                    <time dateTime={activity.timestamp.toISOString()}>
                      {formatTimestamp(activity.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default RecentActivity;