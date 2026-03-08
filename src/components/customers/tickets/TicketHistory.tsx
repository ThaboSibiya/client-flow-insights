import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, Settings, User } from 'lucide-react';

export interface TicketHistoryItem {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'created';
  timestamp: Date;
  user: string;
  details: {
    comment?: string;
    isInternal?: boolean;
    oldStatus?: string;
    newStatus?: string;
    assignedTo?: string;
  };
}

interface TicketHistoryProps {
  history: TicketHistoryItem[];
  formatDate: (dateString: string) => string;
}

const TicketHistory = ({ history, formatDate }: TicketHistoryProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'status_change': return <Settings className="h-3.5 w-3.5" />;
      case 'assignment': return <User className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getEventDescription = (item: TicketHistoryItem) => {
    switch (item.type) {
      case 'comment':
        return (
          <div>
            <span className="font-medium text-foreground">{item.user}</span>
            <span className="text-muted-foreground">
              {item.details.isInternal ? ' added an internal note' : ' commented'}
            </span>
            {item.details.comment && (
              <div className={`mt-1.5 p-2 rounded text-xs ${
                item.details.isInternal
                  ? 'bg-amber-500/10 border-l-2 border-amber-500'
                  : 'bg-primary/5 border-l-2 border-primary'
              }`}>
                {item.details.comment}
              </div>
            )}
          </div>
        );
      case 'status_change':
        return (
          <div className="text-sm">
            <span className="font-medium text-foreground">{item.user}</span>
            <span className="text-muted-foreground"> changed status </span>
            <Badge variant="outline" className="mx-0.5 text-xs">{item.details.oldStatus}</Badge>
            <span className="text-muted-foreground"> → </span>
            <Badge variant="outline" className="mx-0.5 text-xs">{item.details.newStatus}</Badge>
          </div>
        );
      case 'assignment':
        return (
          <div className="text-sm">
            <span className="font-medium text-foreground">{item.user}</span>
            <span className="text-muted-foreground"> assigned to </span>
            <span className="font-medium text-foreground">{item.details.assignedTo}</span>
          </div>
        );
      case 'created':
        return (
          <div className="text-sm">
            <span className="text-muted-foreground">Ticket created by </span>
            <span className="font-medium text-foreground">{item.user}</span>
          </div>
        );
      default:
        return <div className="text-sm text-muted-foreground">Unknown event</div>;
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm text-foreground">History</span>
        <Badge variant="outline" className="text-xs">{history.length}</Badge>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
        {history.map((item) => (
          <div key={item.id} className="relative flex items-start gap-3 pb-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground -ml-6 z-10 border border-border">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              {getEventDescription(item)}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.timestamp.toISOString())}
                </span>
                {item.details.isInternal && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Internal</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketHistory;
