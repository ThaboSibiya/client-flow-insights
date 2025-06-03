
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
  ticket: CustomerTicket;
  onStatusUpdate: (ticketId: string, status: TicketStatus) => void;
}

const TicketCard = ({ ticket, onStatusUpdate }: TicketCardProps) => {
  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(ticket.status)}
            <span className="font-medium">{ticket.ticketNumber}</span>
            <Badge 
              className={`text-white text-xs ${getPriorityColor(ticket.priority)}`}
            >
              {ticket.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-2">{ticket.subject}</p>
          <p className="text-xs text-gray-500">
            Created {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={ticket.status} 
            onValueChange={(status: TicketStatus) => onStatusUpdate(ticket.id, status)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
