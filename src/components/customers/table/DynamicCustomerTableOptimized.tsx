
import React, { useMemo } from 'react';
import { Customer } from '@/types/customer';
import { useIndustryCustomerFields } from '@/hooks/useIndustryCustomerFields';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useCustomerActions } from '@/components/customers/actions/CustomerActions';
import CustomerTableActions from './CustomerTableActions';

interface DynamicCustomerTableOptimizedProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
}

const DynamicCustomerTableOptimized = ({ customers, onCustomerClick }: DynamicCustomerTableOptimizedProps) => {
  const { tableColumns, isLoading, userIndustry } = useIndustryCustomerFields();
  const { 
    handleOpenCustomerDetails, 
    handleManageTickets, 
    handleDeleteCustomer,
    CustomerDialogs 
  } = useCustomerActions();

  const memoizedCustomers = useMemo(() => customers, [customers]);

  const getFieldValue = useMemo(() => (customer: Customer, fieldName: string): string => {
    if (fieldName === 'company_name' || fieldName === 'client_name' || fieldName === 'business_name') {
      return customer.name;
    }
    
    if (fieldName === 'printer_brand' || fieldName === 'equipment_brand') {
      return customer.equipment?.[0]?.brand || 'N/A';
    }
    
    if (fieldName === 'printer_model' || fieldName === 'equipment_model') {
      return customer.equipment?.[0]?.model || 'N/A';
    }
    
    const value = (customer as any)[fieldName];
    return value || 'N/A';
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const TableHeader = React.memo(() => (
    <div className="p-4 border-b bg-gradient-to-r from-quikle-crystal to-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-quikle-charcoal">
          {userIndustry ? `${userIndustry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Customers` : 'Customers'}
        </h3>
        <Badge variant="outline" className="text-xs bg-white">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  ));

  const CustomerRow = React.memo(({ customer }: { customer: Customer }) => (
    <tr
      key={customer.id}
      className="hover:bg-quikle-crystal/50 cursor-pointer transition-all duration-200 border-b border-quikle-silver/20"
      onClick={() => onCustomerClick?.(customer)}
    >
      {tableColumns.map((column) => (
        <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-quikle-charcoal">
          {getFieldValue(customer, column.name)}
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-quikle-slate">
        {formatDate(customer.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <CustomerTableActions
          customer={customer}
          onEdit={handleOpenCustomerDetails}
          onManageTickets={handleManageTickets}
          onDelete={handleDeleteCustomer}
        />
      </td>
    </tr>
  ));

  const EmptyState = React.memo(() => (
    <div className="text-center py-12 text-quikle-slate">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-quikle-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p className="text-lg font-medium text-quikle-charcoal">No customers found</p>
      <p className="text-sm">Try adjusting your filters or add your first customer to get started</p>
    </div>
  ));

  return (
    <>
      <div className="bg-white rounded-lg shadow-elegant border border-quikle-silver/30 overflow-hidden">
        <TableHeader />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-quikle-crystal to-quikle-platinum">
              <tr>
                {tableColumns.map((column) => (
                  <th
                    key={column.name}
                    className="px-6 py-3 text-left text-xs font-medium text-quikle-slate uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-quikle-slate uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-quikle-slate uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-quikle-silver/20">
              {memoizedCustomers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && <EmptyState />}
      </div>
      
      <CustomerDialogs />
    </>
  );
};

export default DynamicCustomerTableOptimized;
