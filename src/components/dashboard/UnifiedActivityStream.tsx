import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/context/CRMContext';
import { 
  Activity, 
  Clock, 
  UserPlus, 
  Edit, 
  Ticket,
  Users,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'customer_added' | 'customer_updated' | 'ticket_created' | 'ticket_resolved' | 'status_changed';
  category: 'customers' | 'tickets' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  customer?: string;
}

interface UnifiedActivityStreamProps {
  customers: Customer[];
}

const UnifiedActivityStream = ({ customers }: UnifiedActivityStreamProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'customers' | 'tickets' | 'system'>('all');

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];
    
    customers.slice(0, 15).forEach((customer) => {
      // Customer creation
      items.push({
        id: `customer-${customer.id}-created`,
        type: 'customer_added',
        category: 'customers',
        title: 'New customer',
        description: customer.name,
        timestamp: customer.createdAt,
        customer: customer.name,
      });

      // Status changes
      if (customer.updatedAt.getTime() !== customer.createdAt.getTime()) {
        items.push({
          id: `customer-${customer.id}-updated`,
          type: 'status_changed',
          category: 'customers',
          title: 'Status updated',
          description: `${customer.name} → ${customer.status}`,
          timestamp: customer.updatedAt,
          customer: customer.name,
        });
      }

      // Tickets
      customer.activeTickets?.forEach(ticket => {
        items.push({
          id: `ticket-${ticket.id}-created`,
          type: 'ticket_created',
          category: 'tickets',
          title: 'New ticket',
          description: ticket.subject,
          timestamp: ticket.createdAt,
          customer: customer.name,
        });

        if (ticket.status === 'resolved') {
          items.push({
            id: `ticket-${ticket.id}-resolved`,
            type: 'ticket_resolved',
            category: 'tickets',
            title: 'Ticket resolved',
            description: ticket.subject,
            timestamp: ticket.updatedAt,
            customer: customer.name,
          });
        }
      });
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
  }, [customers]);

  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return activities;
    return activities.filter(a => a.category === activeTab);
  }, [activities, activeTab]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "h-3.5 w-3.5";
    switch (type) {
      case 'customer_added':
        return <UserPlus className={cn(iconClass, "text-chart-2")} />;
      case 'customer_updated':
      case 'status_changed':
        return <Edit className={cn(iconClass, "text-primary")} />;
      case 'ticket_created':
        return <Ticket className={cn(iconClass, "text-chart-4")} />;
      case 'ticket_resolved':
        return <Ticket className={cn(iconClass, "text-chart-2")} />;
      default:
        return <Activity className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const tabCounts = useMemo(() => ({
    all: activities.length,
    customers: activities.filter(a => a.category === 'customers').length,
    tickets: activities.filter(a => a.category === 'tickets').length,
    system: activities.filter(a => a.category === 'system').length,
  }), [activities]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Activity</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              Live
            </Badge>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-3">
          <TabsList className="h-8 p-0.5 bg-muted/50">
            <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground">
              All
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Users className="h-3 w-3 mr-1" />
              {tabCounts.customers}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Ticket className="h-3 w-3 mr-1" />
              {tabCounts.tickets}
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs h-7 px-3 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Bell className="h-3 w-3 mr-1" />
              {tabCounts.system}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-shrink-0 p-1.5 rounded-md bg-muted/50 group-hover:bg-muted">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground truncate">
                      {activity.title}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UnifiedActivityStream;
