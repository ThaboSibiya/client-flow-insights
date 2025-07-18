
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRM } from '@/context/CRMContext';
import { Activity, Clock, User, Ticket, UserPlus, Edit } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'customer_added' | 'customer_updated' | 'ticket_created' | 'ticket_resolved' | 'status_changed';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  customer?: string;
}

const RealtimeActivityFeed = () => {
  const { customers } = useCRM();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Generate recent activities from customer data
  useEffect(() => {
    const generateActivities = () => {
      const recentActivities: ActivityItem[] = [];
      
      // Get recent customer activities
      customers.slice(0, 10).forEach((customer, index) => {
        // Customer creation activity
        recentActivities.push({
          id: `customer-${customer.id}-created`,
          type: 'customer_added',
          title: 'New Customer Added',
          description: `${customer.name} was added to the system`,
          timestamp: customer.createdAt,
          customer: customer.name,
        });

        // Status change activity if recently updated
        if (customer.updatedAt.getTime() !== customer.createdAt.getTime()) {
          recentActivities.push({
            id: `customer-${customer.id}-updated`,
            type: 'status_changed',
            title: 'Customer Status Updated',
            description: `${customer.name} status changed to ${customer.status}`,
            timestamp: customer.updatedAt,
            customer: customer.name,
          });
        }

        // Ticket activities
        customer.activeTickets?.forEach(ticket => {
          recentActivities.push({
            id: `ticket-${ticket.id}-created`,
            type: 'ticket_created',
            title: 'New Ticket Created',
            description: `${ticket.subject} (${ticket.ticketNumber})`,
            timestamp: ticket.createdAt,
            customer: customer.name,
          });

          if (ticket.status === 'resolved') {
            recentActivities.push({
              id: `ticket-${ticket.id}-resolved`,
              type: 'ticket_resolved',
              title: 'Ticket Resolved',
              description: `${ticket.subject} has been resolved`,
              timestamp: ticket.updatedAt,
              customer: customer.name,
            });
          }
        });
      });

      // Sort by timestamp descending and take the 15 most recent
      return recentActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 15);
    };

    setActivities(generateActivities());
  }, [customers]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'customer_updated':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'ticket_created':
        return <Ticket className="h-4 w-4 text-orange-600" />;
      case 'ticket_resolved':
        return <Ticket className="h-4 w-4 text-green-600" />;
      case 'status_changed':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer_added':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'customer_updated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ticket_created':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ticket_resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'status_changed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="shadow-md h-full bg-gradient-to-br from-white to-gray-50 border-gray-200/70">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-broker-primary">
          <Activity className="h-5 w-5 text-broker-accent animate-pulse" />
          Real-time Activity Feed
          <Badge variant="outline" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-shrink-0 p-2 rounded-full bg-gray-50">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  {activity.customer && (
                    <Badge variant="outline" className={`mt-2 text-xs ${getActivityColor(activity.type)}`}>
                      {activity.customer}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimeActivityFeed;
