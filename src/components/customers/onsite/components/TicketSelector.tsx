import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, CheckCircle } from "lucide-react";
import { OnSiteTicket } from '../types';
import { getPriorityColor, getStatusColor, formatTicketDate } from '@/utils/ticketFormatters';

interface TicketSelectorProps {
  tickets: OnSiteTicket[];
  selectedTicketId: string | null;
  onSelect: (ticket: OnSiteTicket | null) => void;
  loading: boolean;
}

export const TicketSelector = ({ tickets, selectedTicketId, onSelect, loading }: TicketSelectorProps) => {
  if (loading) {
    return (
      <div className="py-3 text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
        <p className="mt-1.5 text-xs text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="py-3 text-center">
        <CheckCircle className="h-5 w-5 mx-auto text-muted-foreground/40 mb-1" />
        <p className="text-xs text-muted-foreground">No open tickets for this customer</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Link to Ticket (optional)</label>
      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {tickets.map((ticket) => {
          const isSelected = selectedTicketId === ticket.id;
          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : ticket)}
              className={`w-full text-left p-2.5 rounded-md border transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Ticket className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{ticket.ticket_number}</p>
                    <p className="text-sm text-foreground truncate">{ticket.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTicketDate(ticket.created_at)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
