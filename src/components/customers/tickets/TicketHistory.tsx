
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
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'status_change':
        return <Settings className="h-4 w-4" />;
      case 'assignment':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventDescription = (item: TicketHistoryItem) => {
    switch (item.type) {
      case 'comment':
        return (
          <div>
            <span className="font-medium">{item.user}</span>
            {item.details.isInternal ? ' added an internal note' : ' added a comment'}
            {item.details.comment && (
              <div className={`mt-2 p-2 rounded text-sm ${
                item.details.isInternal 
                  ? 'bg-amber-50 border-l-2 border-amber-400' 
                  : 'bg-blue-50 border-l-2 border-blue-400'
              }`}>
                {item.details.comment}
              </div>
            )}
          </div>
        );
      case 'status_change':
        return (
          <div>
            <span className="font-medium">{item.user}</span> changed status from{' '}
            <Badge variant="outline" className="mx-1">{item.details.oldStatus}</Badge>
            to{' '}
            <Badge variant="outline" className="mx-1">{item.details.newStatus}</Badge>
          </div>
        );
      case 'assignment':
        return (
          <div>
            <span className="font-medium">{item.user}</span> assigned ticket to{' '}
            <span className="font-medium">{item.details.assignedTo}</span>
          </div>
        );
      case 'created':
        return (
          <div>
            Ticket created by <span className="font-medium">{item.user}</span>
          </div>
        );
      default:
        return <div>Unknown event</div>;
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4" />
        <span className="font-medium text-sm">Ticket History</span>
        <Badge variant="outline" className="text-xs">
          {history.length} events
        </Badge>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
        
        {history.map((item, index) => (
          <div key={item.id} className="relative flex items-start gap-3 pb-4">
            {/* Timeline dot */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
              item.type === 'comment' && item.details.isInternal 
                ? 'bg-amber-500' 
                : item.type === 'comment' 
                ? 'bg-blue-500'
                : item.type === 'status_change'
                ? 'bg-purple-500'
                : 'bg-gray-500'
            }`}>
              {getIcon(item.type)}
            </div>
            
            {/* Event content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                {getEventDescription(item)}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(item.timestamp.toISOString())}
                  </span>
                  {item.details.isInternal && (
                    <Badge variant="secondary" className="text-xs">
                      Internal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketHistory;
