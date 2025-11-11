import React, { useState, useEffect } from 'react';
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
  onAddTimeEntry 
}: TicketManagementDialogProps) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { onCustomerTicketsRefresh, onTicketCreated, onTicketStatusChanged } = useTicketEvents();

  // Listen for ticket-related events to refresh the dialog
  useEffect(() => {
    if (!customer?.id) return;

    const handleRefresh = (data: any) => {
      if (data?.customerId === customer.id) {
        setRefreshKey(prev => prev + 1);
      }
    };

    onCustomerTicketsRefresh(handleRefresh);
    onTicketCreated(handleRefresh);
    onTicketStatusChanged(handleRefresh);
  }, [customer?.id, onCustomerTicketsRefresh, onTicketCreated, onTicketStatusChanged]);

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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-[800px] bg-white border-0 shadow-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-quikle-primary/10 to-quikle-accent/10 p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-quikle-primary flex items-center gap-2">
            Ticket Management - {customer?.name}
            <Badge variant="outline">{customer?.ticketCount || 0} Total Tickets</Badge>
            {getTotalTimeSpent() > 0 && (
              <Badge variant="secondary">{formatTime(getTotalTimeSpent())} Total Time</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Active Tickets</h3>
            <Button 
              onClick={() => setShowNewTicketForm(!showNewTicketForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
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

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketManagementDialog;
