
import React, { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import CustomerDetailsDialog from './forms/CustomerDetailsDialog';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const useCustomerActions = () => {
  const { updateCustomerStatus, deleteCustomer } = useCRM();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<Set<string> | null>(null);

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus) => {
    updateCustomerStatus(customerId, newStatus);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setDeleteTarget(customerId);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleOpenCustomerDetails = (customer: Customer, tab = 'details') => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  // Tickets are now managed inside the Customer Details Sheet (Tickets tab)
  const handleManageTickets = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
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
    setBulkDeleteTargets(selectedCustomers);
  };

  const confirmBulkDelete = async () => {
    if (bulkDeleteTargets) {
      const promises = Array.from(bulkDeleteTargets).map(id => deleteCustomer(id));
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Deleted ${bulkDeleteTargets.size} customer(s)`,
      });
      setBulkDeleteTargets(null);
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
        }} 
      />

      {/* Single delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={!!bulkDeleteTargets} onOpenChange={(open) => !open && setBulkDeleteTargets(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulkDeleteTargets?.size} Customer(s)</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected customers and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
