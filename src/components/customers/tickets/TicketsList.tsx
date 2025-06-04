
import React from 'react';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import TicketCard from './TicketCard';

interface TicketsListProps {
  tickets: CustomerTicket[];
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
}

const TicketsList = ({ tickets, onUpdateTicketStatus, onAddTimeEntry }: TicketsListProps) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tickets found for this customer
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusUpdate={onUpdateTicketStatus}
          onAddTimeEntry={onAddTimeEntry}
        />
      ))}
    </div>
  );
};

export default TicketsList;
