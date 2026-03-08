
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
  
  const getStatusClasses = () => {
    if (urgentTickets.length > 0) return 'bg-destructive/10 text-destructive border-destructive/30';
    if (openTickets.length > 0) return 'bg-primary/10 text-primary border-primary/30';
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  };

  const getStatusText = () => {
    if (urgentTickets.length > 0) return `${urgentTickets.length} Urgent`;
    if (openTickets.length > 0) return `${openTickets.length} Open`;
    return 'All Resolved';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{ticketCount}</span>
      </div>
      
      {ticketCount > 0 && (
        <>
          <Badge 
            variant="outline" 
            className={`text-xs border ${getStatusClasses()}`}
          >
            {getStatusText()}
          </Badge>
          
          {urgentTickets.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          
          {lastTicketDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(lastTicketDate, { addSuffix: true })}</span>
            </div>
          )}
        </>
      )}
      
      {ticketCount === 0 && (
        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
          No Tickets
        </Badge>
      )}
    </div>
  );
};

export default TicketIndicator;
