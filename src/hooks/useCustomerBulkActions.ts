
import { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import { toast } from '@/hooks/use-toast';

export const useCustomerBulkActions = () => {
  const { updateCustomerStatus, deleteCustomer } = useCRM();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkStatusChange = async (selectedCustomers: Set<string>, status: CustomerStatus) => {
    if (selectedCustomers.size === 0) return;
    
    setIsProcessing(true);
    try {
      const promises = Array.from(selectedCustomers).map(id => updateCustomerStatus(id, status));
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Updated ${selectedCustomers.size} customer(s) to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customers",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async (selectedCustomers: Set<string>) => {
    if (selectedCustomers.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?`)) {
      setIsProcessing(true);
      try {
        const promises = Array.from(selectedCustomers).map(id => deleteCustomer(id));
        await Promise.all(promises);
        toast({
          title: "Success",
          description: `Deleted ${selectedCustomers.size} customer(s)`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customers",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return {
    handleBulkStatusChange,
    handleBulkDelete,
    isProcessing,
  };
};
