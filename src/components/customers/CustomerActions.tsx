
import React, { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import CustomerDetailsDialog from './forms/CustomerDetailsDialog';
import TicketManagementDialog from './TicketManagementDialog';
import { toast } from '@/hooks/use-toast';

export const useCustomerActions = () => {
  const { updateCustomerStatus, deleteCustomer, createTicket, updateTicketStatus, addTimeEntry } = useCRM();
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

  const handleBulkStatusChange = async (selectedCustomers: Set<string>, status: CustomerStatus) => {
    const promises = Array.from(selectedCustomers).map(id => updateCustomerStatus(id, status));
    await Promise.all(promises);
    toast({
      title: "Success",
      description: `Updated ${selectedCustomers.size} customer(s) to ${status}`,
    });
  };

  const handleBulkDelete = async (selectedCustomers: Set<string>) => {
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?`)) {
      const promises = Array.from(selectedCustomers).map(id => deleteCustomer(id));
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Deleted ${selectedCustomers.size} customer(s)`,
      });
    }
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

      <TicketManagementDialog 
        customer={selectedCustomer}
        isOpen={isTicketDialogOpen}
        onClose={() => {
          setIsTicketDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onCreateTicket={createTicket}
        onUpdateTicketStatus={updateTicketStatus}
        onAddTimeEntry={addTimeEntry}
      />
    </>
  );

  return {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    handleBulkStatusChange,
    handleBulkDelete,
    CustomerDialogs,
  };
};
