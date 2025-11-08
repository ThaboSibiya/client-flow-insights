import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Bell, Clock, User } from 'lucide-react';

interface ReminderHistoryPanelProps {
  customerId: string;
}

interface ReminderHistory {
  id: string;
  reminder_type: string;
  message: string;
  sent_at: string;
  sent_by: string;
  status: string;
}

const ReminderHistoryPanel = ({ customerId }: ReminderHistoryPanelProps) => {
  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminder-history', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminder_history')
        .select('*')
        .eq('customer_id', customerId)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ReminderHistory[];
    },
  });

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return 'Payment Reminder';
      case 'overdue_payment':
        return 'Overdue Payment';
      case 'account_flagged':
        return 'Account Flagged';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment_reminder':
        return 'text-blue-600 bg-blue-50';
      case 'overdue_payment':
        return 'text-red-600 bg-red-50';
      case 'account_flagged':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Reminder History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !reminders || reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reminders sent yet
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(
                        reminder.reminder_type
                      )}`}
                    >
                      {getReminderTypeLabel(reminder.reminder_type)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(reminder.sent_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-2 line-clamp-3">
                    {reminder.message}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    Sent by: {reminder.sent_by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReminderHistoryPanel;
