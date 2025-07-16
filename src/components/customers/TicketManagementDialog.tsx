
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertCircle } from 'lucide-react';

interface TicketManagementDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (customerId: string, ticketData: any) => void;
  onUpdateTicketStatus: (ticketId: string, status: string) => void;
  onAddTimeEntry: (ticketId: string, timeEntry: any) => void;
}

const TicketManagementDialog = ({ 
  customer, 
  isOpen, 
  onClose, 
  onCreateTicket, 
  onUpdateTicketStatus, 
  onAddTimeEntry 
}: TicketManagementDialogProps) => {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ticket Management - {customer.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{customer.email}</span>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              <h3 className="font-semibold">Active Tickets</h3>
              <Badge variant="secondary">{customer.ticketCount || 0}</Badge>
            </div>
            
            {customer.ticketCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active tickets for this customer</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customer.activeTickets?.map((ticket, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{ticket.subject || 'No subject'}</h4>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Ticket management functionality is not yet fully implemented.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketManagementDialog;
