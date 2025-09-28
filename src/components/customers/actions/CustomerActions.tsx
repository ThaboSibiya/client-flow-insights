
import React, { useState, lazy, Suspense } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import { CustomerTicket, TicketStatus, TimeEntry } from '@/types/customer';
import { CustomerStatusChangeEvent, CustomerActionEvent } from '@/types/events';
import { useTicketManagement } from '@/hooks/useTicketManagement';
import CustomerDetailsDialog from '../forms/CustomerDetailsDialog';
import { toast } from '@/hooks/use-toast';

const TicketManagementDialog = lazy(() => import('../TicketManagementDialog'));

export const useCustomerActions = () => {
  const { updateCustomerStatus, deleteCustomer } = useCRM();
  const { handleCreateTicket, handleUpdateTicketStatus, handleAddTimeEntry } = useTicketManagement();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState('details');

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus): void => {
    try {
      updateCustomerStatus(customerId, newStatus);
      toast({
        title: "Status Updated",
        description: `Customer status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = (customerId: string): void => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        deleteCustomer(customerId);
        toast({
          title: "Customer Deleted",
          description: "Customer has been successfully removed",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete customer",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenCustomerDetails = (customer: Customer, tab: string = 'details'): void => {
    setSelectedCustomer(customer);
    setActiveDialogTab(tab);
    setIsFormOpen(true);
  };

  const handleManageTickets = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setIsTicketDialogOpen(true);
  };

  const closeDetailsDialog = (): void => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setActiveDialogTab('details');
  };

  const closeTicketDialog = (): void => {
    setIsTicketDialogOpen(false);
    setSelectedCustomer(null);
  };

  return {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    handleCreateTicket,
    handleUpdateTicketStatus,
    handleAddTimeEntry,
    selectedCustomer,
    isFormOpen,
    isTicketDialogOpen,
    activeDialogTab,
    closeDetailsDialog,
    closeTicketDialog,
  };
};

// Separate component for dialogs
export interface CustomerActionDialogsProps {
  selectedCustomer: Customer | null;
  isFormOpen: boolean;
  isTicketDialogOpen: boolean;
  onCloseDetailsDialog: () => void;
  onCloseTicketDialog: () => void;
  onCreateTicket: (customerId: string, ticket: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>) => void;
}

export const CustomerActionDialogs: React.FC<CustomerActionDialogsProps> = ({
  selectedCustomer,
  isFormOpen,
  isTicketDialogOpen,
  onCloseDetailsDialog,
  onCloseTicketDialog,
  onCreateTicket,
  onUpdateTicketStatus,
  onAddTimeEntry,
}) => {
  return (
    <>
      <CustomerDetailsDialog 
        customer={selectedCustomer} 
        isOpen={isFormOpen} 
        onClose={onCloseDetailsDialog} 
      />

      <Suspense fallback={null}>
        {isTicketDialogOpen && (
          <TicketManagementDialog 
            customer={selectedCustomer}
            isOpen={isTicketDialogOpen}
            onClose={onCloseTicketDialog}
            onCreateTicket={onCreateTicket}
            onUpdateTicketStatus={onUpdateTicketStatus}
            onAddTimeEntry={onAddTimeEntry}
          />
        )}
      </Suspense>
    </>
  );
};
