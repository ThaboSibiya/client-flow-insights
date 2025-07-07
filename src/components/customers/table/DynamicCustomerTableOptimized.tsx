
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'existing': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finalised': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const TableHeader = React.memo(() => (
    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {userIndustry ? `${userIndustry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Customers` : 'Customers'}
          </h3>
          <p className="text-sm text-slate-600 mt-1">Manage your customer relationships and service history</p>
        </div>
        <Badge variant="outline" className="bg-white shadow-sm border-slate-300">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  ));

  const CustomerRow = React.memo(({ customer, index }: { customer: Customer; index: number }) => (
    <tr
      key={customer.id}
      className={`hover:bg-slate-50 cursor-pointer transition-all duration-200 border-b border-slate-100 ${
        index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
      }`}
      onClick={() => onCustomerClick?.(customer)}
    >
      {tableColumns.map((column) => (
        <td key={column.name} className="px-6 py-4 text-sm">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">
              {getFieldValue(customer, column.name)}
            </span>
            {column.name === 'name' && customer.email && (
              <span className="text-xs text-slate-500 mt-1">{customer.email}</span>
            )}
          </div>
        </td>
      ))}
      <td className="px-6 py-4 text-sm">
        <div className="flex flex-col space-y-1">
          <span className="text-slate-900">{customer.phone || 'No phone'}</span>
          {customer.address && (
            <span className="text-xs text-slate-500 truncate max-w-32">{customer.address}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge 
          className={`text-xs font-medium px-3 py-1 ${getStatusColor(customer.status || 'new')}`}
          variant="outline"
        >
          {(customer.status || 'new').charAt(0).toUpperCase() + (customer.status || 'new').slice(1)}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {customer.ticketCount || 0} tickets
          </Badge>
          {(customer.ticketCount || 0) > 0 && (
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDate(customer.createdAt)}
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">No customers found</h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Get started by adding your first customer or adjust your search filters to find existing customers.
      </p>
    </div>
  ));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <TableHeader />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {tableColumns.map((column) => (
                  <th
                    key={column.name}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {memoizedCustomers.map((customer, index) => (
                <CustomerRow key={customer.id} customer={customer} index={index} />
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
