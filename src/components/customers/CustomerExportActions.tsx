
import React from 'react';
import { Customer } from '@/types/customer';
import { exportCustomers } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';

interface CustomerExportActionsProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  selectedCustomers: Set<string>;
}

export const useCustomerExport = ({ 
  customers, 
  filteredCustomers, 
  selectedCustomers 
}: CustomerExportActionsProps) => {
  const getDataToExport = () => {
    return selectedCustomers.size > 0 
      ? customers.filter(c => selectedCustomers.has(c.id))
      : filteredCustomers;
  };

  const handleExportCSV = () => {
    const dataToExport = getDataToExport();
    
    exportCustomers({
      customers: dataToExport,
      format: 'csv',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as CSV`,
    });
  };

  const handleExportJSON = () => {
    const dataToExport = getDataToExport();
    
    exportCustomers({
      customers: dataToExport,
      format: 'json',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as JSON`,
    });
  };

  const handleExportExcel = () => {
    const dataToExport = getDataToExport();
    
    exportCustomers({
      customers: dataToExport,
      format: 'excel',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as Excel`,
    });
  };

  return {
    handleExportCSV,
    handleExportJSON,
    handleExportExcel,
  };
};
