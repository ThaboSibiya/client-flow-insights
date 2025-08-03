
import { useMemo } from 'react';
import { useCustomerCustomData } from './useCustomerCustomData';
import { Customer } from '@/types/customer';

interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'number' | 'custom';
  sortable: boolean;
  width?: string;
  priority: 'high' | 'medium' | 'low'; // for responsive hiding
}

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Name', type: 'text', sortable: true, priority: 'high' },
  { key: 'email', label: 'Email', type: 'email', sortable: true, priority: 'high' },
  { key: 'phone', label: 'Phone', type: 'phone', sortable: false, priority: 'medium' },
  { key: 'status', label: 'Status', type: 'select', sortable: true, priority: 'high' },
];

export const useDynamicTableColumns = (customers: Customer[], selectedIndustries: string[] = []) => {
  // Get custom data from the first few customers to determine available fields
  const sampleCustomerIds = customers.slice(0, 5).map(c => c.id);
  
  const dynamicColumns = useMemo(() => {
    const columns = [...DEFAULT_COLUMNS];
    
    // Analyze custom fields across customers to determine common fields
    const customFieldsMap = new Map<string, { label: string; type: string; count: number; required: boolean }>();
    
    customers.forEach(customer => {
      // For now, we'll use a placeholder for custom data analysis
      // In a real implementation, this would analyze the customer's applied templates
      // and their custom field data to determine which fields to show
    });
    
    // Add tickets column
    columns.push({
      key: 'tickets',
      label: 'Tickets',
      type: 'custom',
      sortable: true,
      priority: 'medium'
    });
    
    // Add created date
    columns.push({
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      sortable: true,
      priority: 'low'
    });
    
    return columns;
  }, [customers, selectedIndustries]);
  
  const getColumnValue = (customer: Customer, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return customer.name;
      case 'email':
        return customer.email;
      case 'phone':
        return customer.phone;
      case 'status':
        return customer.status;
      case 'tickets':
        return customer.ticketCount || 0;
      case 'createdAt':
        return customer.createdAt;
      default:
        // For custom fields, we'd look up the value in customer custom data
        return null;
    }
  };
  
  const getVisibleColumns = (screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
    switch (screenSize) {
      case 'mobile':
        return dynamicColumns.filter(col => col.priority === 'high').slice(0, 2);
      case 'tablet':
        return dynamicColumns.filter(col => col.priority !== 'low');
      default:
        return dynamicColumns;
    }
  };
  
  return {
    columns: dynamicColumns,
    getColumnValue,
    getVisibleColumns
  };
};
