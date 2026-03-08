
import React from 'react';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import TicketCard from './TicketCard';
import { Ticket } from 'lucide-react';

interface TicketsListProps {
  tickets: CustomerTicket[];
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
  customerEmail?: string;
  customerName?: string;
  customerId?: string;
}

const TicketsList = ({ 
  tickets, 
  onUpdateTicketStatus, 
  onAddTimeEntry, 
  customerEmail, 
  customerName, 
  customerId 
}: TicketsListProps) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-3 rounded-full bg-muted inline-flex mb-3">
          <Ticket className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No Tickets</p>
        <p className="text-xs text-muted-foreground">
          Create a ticket to start tracking work for this customer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusUpdate={(ticketId, status) => onUpdateTicketStatus(ticketId, status)}
          onAddTimeEntry={onAddTimeEntry}
          customerEmail={customerEmail}
          customerName={customerName}
          customerId={customerId}
        />
      ))}
    </div>
  );
};

export default TicketsList;
