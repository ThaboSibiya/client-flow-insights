
import React from 'react';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import TicketCard from './TicketCard';

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
