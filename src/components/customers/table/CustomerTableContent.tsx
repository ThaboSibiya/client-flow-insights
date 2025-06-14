
import React, { useState } from 'react';
import { Customer } from '@/types/customer';
import { useCustomerActions } from '../actions/CustomerActions';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerTableHeader from './CustomerTableHeader';
import CustomerTableRow from './CustomerTableRow';
import CustomerPagination from './CustomerPagination';
import MobileCustomerCard from './MobileCustomerCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerTableContentProps {
  paginatedCustomers: Customer[];
  selectedCustomers: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectCustomer: (customerId: string, checked: boolean) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const CustomerTableContent = ({
  paginatedCustomers,
  selectedCustomers,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectCustomer,
  sortBy,
  sortOrder,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: CustomerTableContentProps) => {
  const isMobile = useIsMobile();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    CustomerDialogs,
  } = useCustomerActions();

  // Skeleton loading state
  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div 
          className="space-y-3"
          role="list"
          aria-label="Customer list"
        >
          {paginatedCustomers.map((customer) => (
            <MobileCustomerCard
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomers.has(customer.id)}
              onSelect={(checked) => onSelectCustomer(customer.id, checked)}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenCustomerDetails}
              onDelete={handleDeleteCustomer}
              onManageTickets={handleManageTickets}
              isExpanded={expandedCard === customer.id}
              onToggleExpanded={() => setExpandedCard(
                expandedCard === customer.id ? null : customer.id
              )}
            />
          ))}
        </div>

        {paginatedCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-fade-in">
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </div>
        )}

        <CustomerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />

        <CustomerDialogs />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div 
        className="bg-white rounded-lg shadow-sm border overflow-hidden transition-shadow duration-200 hover:shadow-md"
        role="region"
        aria-label="Customer data table"
      >
        <div className="overflow-x-auto">
          <table 
            className="w-full"
            role="table"
            aria-label="Customer information table"
          >
            <CustomerTableHeader
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              onSelectAll={onSelectAll}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <tbody 
              className="divide-y divide-gray-200"
              role="rowgroup"
            >
              {paginatedCustomers.map((customer, index) => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomers.has(customer.id)}
                  onSelect={(checked) => onSelectCustomer(customer.id, checked)}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenCustomerDetails}
                  onDelete={handleDeleteCustomer}
                  onManageTickets={handleManageTickets}
                  rowIndex={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {paginatedCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500" role="status">
            <div className="animate-fade-in">
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>

      <CustomerPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <CustomerDialogs />
    </div>
  );
};

export default CustomerTableContent;
