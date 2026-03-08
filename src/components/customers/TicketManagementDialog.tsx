import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Customer, CustomerTicket, TicketStatus } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import NewTicketForm from './tickets/NewTicketForm';
import TicketsList from './tickets/TicketsList';
import { useTicketEvents } from '@/hooks/useTicketEvents';
import { formatDuration } from '@/utils/ticketFormatters';

interface TicketManagementDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (customerId: string, ticket: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
}

const TicketManagementDialog = ({
  customer,
  isOpen,
  onClose,
  onCreateTicket,
  onUpdateTicketStatus,
  onAddTimeEntry,
}: TicketManagementDialogProps) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback((data: any) => {
    if (data?.customerId === customer?.id) {
      setRefreshKey(prev => prev + 1);
    }
  }, [customer?.id]);

  useTicketEvents({
    onCustomerTicketsRefresh: handleRefresh,
    onTicketCreated: handleRefresh,
    onTicketStatusChanged: handleRefresh,
  });

  const handleCreateTicket = (ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    if (customer) {
      onCreateTicket(customer.id, ticketData);
      setShowNewTicketForm(false);
    }
  };

  const getTotalTimeSpent = () => {
    if (!customer?.activeTickets) return 0;
    return customer.activeTickets.reduce((total, ticket) => total + (ticket.totalTimeSpent || 0), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
            Tickets — {customer?.name}
            <Badge variant="outline" className="text-xs">{customer?.ticketCount || 0} total</Badge>
            {getTotalTimeSpent() > 0 && (
              <Badge variant="secondary" className="text-xs">{formatDuration(getTotalTimeSpent())}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-foreground">Active Tickets</h3>
            <Button size="sm" onClick={() => setShowNewTicketForm(!showNewTicketForm)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Ticket
            </Button>
          </div>

          {showNewTicketForm && (
            <NewTicketForm
              onSubmit={handleCreateTicket}
              onCancel={() => setShowNewTicketForm(false)}
            />
          )}

          <TicketsList
            key={refreshKey}
            tickets={customer?.activeTickets || []}
            onUpdateTicketStatus={onUpdateTicketStatus}
            onAddTimeEntry={onAddTimeEntry}
            customerEmail={customer?.email}
            customerName={customer?.name}
            customerId={customer?.id}
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketManagementDialog;
