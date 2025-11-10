import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Send, AlertTriangle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  daysFrom: number;
  reminderType: string;
  autoSend?: boolean;
}

interface ReminderWorkflowProps {
  customerId: string;
  daysOverdue: number;
  lastReminderSent?: string | null;
  onSendReminder: (type: string) => void;
}

const ReminderWorkflow = ({ customerId, daysOverdue, lastReminderSent, onSendReminder }: ReminderWorkflowProps) => {
  const workflowSteps: WorkflowStep[] = [
    {
      id: '1',
      title: 'First Reminder',
      description: 'Friendly payment reminder',
      status: daysOverdue >= 7 ? 'completed' : daysOverdue < 7 && daysOverdue > 0 ? 'current' : 'upcoming',
      daysFrom: 7,
      reminderType: 'payment_reminder',
    },
    {
      id: '2',
      title: 'Second Reminder',
      description: 'Overdue payment notice',
      status: daysOverdue >= 14 ? 'completed' : daysOverdue >= 7 && daysOverdue < 14 ? 'current' : 'upcoming',
      daysFrom: 14,
      reminderType: 'overdue_payment',
    },
    {
      id: '3',
      title: 'Final Notice',
      description: 'Final warning before collection',
      status: daysOverdue >= 30 ? 'completed' : daysOverdue >= 14 && daysOverdue < 30 ? 'current' : 'upcoming',
      daysFrom: 30,
      reminderType: 'final_notice',
    },
    {
      id: '4',
      title: 'Collection Action',
      description: 'Account sent to collections',
      status: daysOverdue >= 60 ? 'current' : 'upcoming',
      daysFrom: 60,
      reminderType: 'collection',
    },
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Collection Workflow</span>
          <Badge variant={daysOverdue > 30 ? 'destructive' : 'default'}>
            {daysOverdue} Days Overdue
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id}>
              <div className={`border-2 rounded-lg p-4 ${getStepColor(step.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStepIcon(step.status)}
                    <div>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Triggered at {step.daysFrom} days overdue
                      </p>
                    </div>
                  </div>

                  {step.status === 'current' && step.reminderType !== 'collection' && (
                    <Button
                      size="sm"
                      onClick={() => onSendReminder(step.reminderType)}
                      className="ml-2"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  )}

                  {step.status === 'current' && step.reminderType === 'collection' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="ml-2"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Start Collection
                    </Button>
                  )}
                </div>
              </div>

              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h5 className="font-semibold text-yellow-900">Workflow Tips</h5>
              <p className="text-sm text-yellow-800 mt-1">
                Follow the workflow steps in order for best results. Each reminder escalates the urgency.
                Consider offering payment plans at the second reminder stage.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderWorkflow;
