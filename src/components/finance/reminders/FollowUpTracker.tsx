import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface ReminderRecord {
  id: string;
  customer_id: string;
  reminder_type: string;
  message: string;
  sent_at: string;
  sent_by: string;
  status: string;
}

interface Customer {
  name: string;
  email: string;
}

const FollowUpTracker = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());

  // Fetch reminders and customers
  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['follow-ups', user?.id],
    queryFn: async () => {
      const { data: reminders, error } = await supabase
        .from('reminder_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch customer details
      if (reminders && reminders.length > 0) {
        const customerIds = [...new Set(reminders.map((r: any) => r.customer_id))];
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, email')
          .in('id', customerIds);

        if (customerData) {
          const customerMap = new Map(customerData.map((c: any) => [c.id, c]));
          setCustomers(customerMap);
        }
      }

      return reminders as ReminderRecord[];
    },
    enabled: !!user,
  });

  const pendingFollowUps = followUps.filter(f => {
    const daysSinceSent = Math.floor((new Date().getTime() - new Date(f.sent_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent <= 7;
  });

  const recentReminders = followUps.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reminders Sent</p>
                <p className="text-2xl font-bold">{followUps.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent (Last 7 Days)</p>
                <p className="text-2xl font-bold">{pendingFollowUps.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reminders sent yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentReminders.map((followUp) => {
                const customer = customers.get(followUp.customer_id);
                return (
                  <div
                    key={followUp.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{customer?.name || 'Unknown Customer'}</h4>
                          <Badge className="bg-blue-100 text-blue-800">
                            {followUp.reminder_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {customer?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Sent: {format(new Date(followUp.sent_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="text-sm mt-2 line-clamp-2">
                          {followUp.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpTracker;
