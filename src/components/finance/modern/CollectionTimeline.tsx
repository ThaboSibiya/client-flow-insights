import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  AlertTriangle,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  daysFrom: number;
  reminderType: string;
}

interface CollectionTimelineProps {
  daysOverdue: number;
  onSendReminder: (type: string) => void;
  compact?: boolean;
}

const CollectionTimeline = ({ 
  daysOverdue, 
  onSendReminder,
  compact = false 
}: CollectionTimelineProps) => {
  const steps: TimelineStep[] = [
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
      title: 'Second Notice',
      description: 'Overdue payment notice',
      status: daysOverdue >= 14 ? 'completed' : daysOverdue >= 7 ? 'current' : 'upcoming',
      daysFrom: 14,
      reminderType: 'overdue_payment',
    },
    {
      id: '3',
      title: 'Final Warning',
      description: 'Pre-collection warning',
      status: daysOverdue >= 30 ? 'completed' : daysOverdue >= 14 ? 'current' : 'upcoming',
      daysFrom: 30,
      reminderType: 'final_notice',
    },
    {
      id: '4',
      title: 'Collection',
      description: 'Sent to collections',
      status: daysOverdue >= 60 ? 'current' : 'upcoming',
      daysFrom: 60,
      reminderType: 'collection',
    },
  ];

  const getStepIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return (
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary items-center justify-center">
              <span className="text-[8px] text-primary-foreground font-bold">{index + 1}</span>
            </span>
          </span>
        );
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (compact) {
    // Compact horizontal timeline
    return (
      <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-medium",
              step.status === 'completed' && "bg-green-100 text-green-700",
              step.status === 'current' && "bg-primary text-primary-foreground",
              step.status === 'upcoming' && "bg-muted text-muted-foreground"
            )}>
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 w-4 mx-0.5",
                step.status === 'completed' ? "bg-green-500" : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {daysOverdue}d overdue
        </span>
      </div>
    );
  }

  // Full vertical timeline
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={cn(
              "absolute left-[7px] top-6 w-0.5 h-full -mb-2",
              step.status === 'completed' ? "bg-green-500" : "bg-border"
            )} />
          )}
          
          <div className={cn(
            "relative flex items-start gap-3 p-3 rounded-lg transition-colors",
            step.status === 'current' && "bg-primary/5"
          )}>
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5 z-10 bg-background">
              {getStepIcon(step.status, index)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className={cn(
                    "text-sm font-medium",
                    step.status === 'upcoming' && "text-muted-foreground"
                  )}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {step.description} · Day {step.daysFrom}
                  </p>
                </div>
                
                {step.status === 'current' && step.reminderType !== 'collection' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onSendReminder(step.reminderType)}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                )}
                
                {step.status === 'current' && step.reminderType === 'collection' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionTimeline;
