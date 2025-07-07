
import React from 'react';
import { Customer } from '@/types/customer';
import { useIndustryCustomerFields } from '@/hooks/useIndustryCustomerFields';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface DynamicCustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
}

const DynamicCustomerTable = ({ customers, onCustomerClick }: DynamicCustomerTableProps) => {
  const { tableColumns, isLoading, userIndustry } = useIndustryCustomerFields();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const getFieldValue = (customer: Customer, fieldName: string): string => {
    // Handle nested properties and industry-specific fields
    if (fieldName === 'company_name' || fieldName === 'client_name' || fieldName === 'business_name') {
      return customer.name;
    }
    
    if (fieldName === 'printer_brand' || fieldName === 'equipment_brand') {
      return customer.equipment?.[0]?.brand || 'N/A';
    }
    
    if (fieldName === 'printer_model' || fieldName === 'equipment_model') {
      return customer.equipment?.[0]?.model || 'N/A';
    }
    
    // Handle standard customer properties
    const value = (customer as any)[fieldName];
    return value || 'N/A';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {userIndustry ? `${userIndustry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Customers` : 'Customers'}
          </h3>
          <Badge variant="outline" className="text-xs">
            {customers.length} customers
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={column.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCustomerClick?.(customer)}
              >
                {tableColumns.map((column) => (
                  <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getFieldValue(customer, column.name)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      customer.status === 'new' ? 'default' :
                      customer.status === 'existing' ? 'secondary' :
                      customer.status === 'pending' ? 'outline' : 'destructive'
                    }
                    className="capitalize"
                  >
                    {customer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No customers found</p>
          <p className="text-sm">Add your first customer to get started</p>
        </div>
      )}
    </div>
  );
};

export default DynamicCustomerTable;
