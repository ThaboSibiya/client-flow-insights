
import React, { useState, lazy, Suspense } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { useCRM } from '@/context/CRMContext';
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

  const CustomerDialogs = () => (
    <>
      <CustomerDetailsDialog 
        customer={selectedCustomer} 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
          setActiveDialogTab('details');
        }} 
      />

      <Suspense fallback={null}>
        {isTicketDialogOpen && (
          <TicketManagementDialog 
            customer={selectedCustomer}
            isOpen={isTicketDialogOpen}
            onClose={() => {
              setIsTicketDialogOpen(false);
              setSelectedCustomer(null);
            }}
            onCreateTicket={handleCreateTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onAddTimeEntry={handleAddTimeEntry}
          />
        )}
      </Suspense>
    </>
  );

  return {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    CustomerDialogs,
  };
};
