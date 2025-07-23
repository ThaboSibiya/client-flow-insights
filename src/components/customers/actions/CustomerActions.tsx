
import React, { useState, lazy, Suspense } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
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

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus) => {
    updateCustomerStatus(customerId, newStatus);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
    }
  };

  const handleOpenCustomerDetails = (customer: Customer, tab = 'details') => {
    setSelectedCustomer(customer);
    setActiveDialogTab(tab);
    setIsFormOpen(true);
  };

  const handleManageTickets = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsTicketDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setActiveDialogTab('details');
  };

  const closeTicketDialog = () => {
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
export const CustomerActionDialogs: React.FC<{
  selectedCustomer: Customer | null;
  isFormOpen: boolean;
  isTicketDialogOpen: boolean;
  onCloseDetailsDialog: () => void;
  onCloseTicketDialog: () => void;
  onCreateTicket: (customerId: string, ticket: any) => void;
  onUpdateTicketStatus: (ticketId: string, status: any) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
}> = ({
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
