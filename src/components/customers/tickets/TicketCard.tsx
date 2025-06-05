
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import { User, Clock, AlertCircle, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import TimeTracker from './TimeTracker';
import TicketAttachments from './TicketAttachments';
import TicketComments from './TicketComments';

interface TicketCardProps {
  ticket: CustomerTicket;
  onStatusUpdate: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
}

const TicketCard = ({ ticket, onStatusUpdate, onAddTimeEntry }: TicketCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleAddTimeEntry = (timeEntry: any) => {
    if (onAddTimeEntry) {
      onAddTimeEntry(ticket.id, timeEntry);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-sm">{ticket.ticketNumber}</h4>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
              {ticket.priority}
            </Badge>
            {ticket.totalTimeSpent > 0 && (
              <Badge variant="outline" className="text-xs">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(ticket.totalTimeSpent)}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
          {ticket.description && (
            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={ticket.status} onValueChange={(value: TicketStatus) => onStatusUpdate(ticket.id, value)}>
            <SelectTrigger className={`w-32 ${getStatusColor(ticket.status)}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {onAddTimeEntry && (
            <div className="border-t pt-3">
              <TimeTracker
                timeEntries={ticket.timeEntries || []}
                totalTimeSpent={ticket.totalTimeSpent || 0}
                onAddTimeEntry={handleAddTimeEntry}
              />
            </div>
          )}

          <TicketAttachments ticketId={ticket.id} />
          <TicketComments ticketId={ticket.id} />
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created {formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Assigned to {ticket.assignedTo.name}</span>
            </div>
          )}
        </div>
        {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
          <span>Updated {formatDate(ticket.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
