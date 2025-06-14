
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
    if (urgentTickets.length > 0) return 'bg-red-600 text-white';
    if (openTickets.length > 0) return 'bg-slate-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  const getStatusText = () => {
    if (urgentTickets.length > 0) return `${urgentTickets.length} Urgent`;
    if (openTickets.length > 0) return `${openTickets.length} Open`;
    return 'All Resolved';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Ticket className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium">{ticketCount}</span>
      </div>
      
      {ticketCount > 0 && (
        <>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor()}`}
          >
            {getStatusText()}
          </Badge>
          
          {urgentTickets.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          
          {lastTicketDate && (
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(lastTicketDate, { addSuffix: true })}</span>
            </div>
          )}
        </>
      )}
      
      {ticketCount === 0 && (
        <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
          No Tickets
        </Badge>
      )}
    </div>
  );
};

export default TicketIndicator;
