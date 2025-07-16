
import { useState } from 'react';
import { Customer } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

interface UseCustomerExportProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  selectedCustomers: Set<string>;
}

export const useCustomerExport = ({ customers, filteredCustomers, selectedCustomers }: UseCustomerExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const getExportCount = () => {
    if (selectedCustomers.size > 0) {
      return selectedCustomers.size;
    }
    return filteredCustomers.length;
  };

  const exportCustomers = async (format: 'csv' | 'excel' | 'json' = 'csv') => {
    setIsExporting(true);
    try {
      const customersToExport = selectedCustomers.size > 0 
        ? customers.filter(c => selectedCustomers.has(c.id))
        : filteredCustomers;

      // Mock export functionality
      const data = customersToExport.map(customer => ({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        created_at: customer.created_at,
        notes: customer.notes
      }));

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported ${data.length} customers`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export customers",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportCustomers,
    getExportCount,
    isExporting
  };
};
