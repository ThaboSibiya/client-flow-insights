
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, AlertTriangle } from 'lucide-react';
import { CustomerTicket } from '@/types/customer';
import { formatDistanceToNow } from 'date-fns';

interface TicketIndicatorProps {
  tickets: CustomerTicket[];
  ticketCount: number;
  lastTicketDate?: Date;
}

const TicketIndicator = ({ tickets, ticketCount, lastTicketDate }: TicketIndicatorProps) => {
  const openTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in-progress');
  const urgentTickets = tickets.filter(ticket => ticket.priority === 'urgent' && ticket.status !== 'closed');
  
  const getStatusColor = () => {
    if (urgentTickets.length > 0) return 'bg-red-500';
    if (openTickets.length > 0) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (urgentTickets.length > 0) return `${urgentTickets.length} Urgent`;
    if (openTickets.length > 0) return `${openTickets.length} Open`;
    return 'All Resolved';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Ticket className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">{ticketCount}</span>
      </div>
      
      {ticketCount > 0 && (
        <>
          <Badge 
            variant="secondary" 
            className={`text-white text-xs ${getStatusColor()}`}
          >
            {getStatusText()}
          </Badge>
          
          {urgentTickets.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          
          {lastTicketDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(lastTicketDate, { addSuffix: true })}</span>
            </div>
          )}
        </>
      )}
      
      {ticketCount === 0 && (
        <Badge variant="outline" className="text-xs">
          No Tickets
        </Badge>
      )}
    </div>
  );
};

export default TicketIndicator;
