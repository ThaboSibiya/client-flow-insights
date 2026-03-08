import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { OnSiteTicket } from '../types';
import CustomerContextCard from '../../tickets/CustomerContextCard';
import { getPriorityColor, getStatusColor, formatTicketDate } from '@/utils/ticketFormatters';

interface TicketsTabProps {
  tickets: OnSiteTicket[];
  loading: boolean;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const TicketsTab = ({
  tickets,
  loading,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
}: TicketsTabProps) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customerId && customerName && (
        <CustomerContextCard
          customerId={customerId}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          compact={true}
        />
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
          <p className="text-muted-foreground">No pending tickets for this customer</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border-l-4 border-l-primary">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs font-mono text-muted-foreground">{ticket.ticket_number}</h4>
                    <p className="text-sm text-foreground mt-0.5">{ticket.subject}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                      {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)} variant="outline">
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTicketDate(ticket.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
