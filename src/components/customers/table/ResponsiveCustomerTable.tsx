
import React, { useState } from 'react';
import { Customer } from '@/types/customer';
import { useIsMobile } from '@/hooks/use-mobile';
import DynamicCustomerTableOptimized from './DynamicCustomerTableOptimized';
import CustomerTableContent from './CustomerTableContent';
import { useCustomerActions } from '../actions/CustomerActions';
import { useTableSelection } from '@/hooks/useTableSelection';

interface ResponsiveCustomerTableProps {
  customers: Customer[];
  searchQuery: string;
  statusFilter: string;
  dateRange: { start: Date | null; end: Date | null };
  ticketCountFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  isLoading?: boolean;
}

const ResponsiveCustomerTable = ({
  customers,
  searchQuery,
  statusFilter,
  dateRange,
  ticketCountFilter,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
}: ResponsiveCustomerTableProps) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const {
    selectedItems: selectedCustomers,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  } = useTableSelection(customers);

  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    CustomerDialogs,
  } = useCustomerActions();

  // Filter customers based on current filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    const matchesTickets = ticketCountFilter === 'all' || 
      (ticketCountFilter === 'with-tickets' && (customer.ticketCount || 0) > 0) ||
      (ticketCountFilter === 'no-tickets' && (customer.ticketCount || 0) === 0);
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (customer.createdAt >= dateRange.start && customer.createdAt <= dateRange.end);

    return matchesSearch && matchesStatus && matchesTickets && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  if (isMobile) {
    return (
      <>
        <CustomerTableContent
          paginatedCustomers={paginatedCustomers}
          selectedCustomers={selectedCustomers}
          isAllSelected={isAllSelected}
          isIndeterminate={isPartiallySelected}
          onSelectAll={handleSelectAll}
          onSelectCustomer={handleSelectItem}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
        <CustomerDialogs />
      </>
    );
  }

  return (
    <>
      <DynamicCustomerTableOptimized
        customers={paginatedCustomers}
        onCustomerClick={handleOpenCustomerDetails}
      />
      <CustomerDialogs />
    </>
  );
};

export default ResponsiveCustomerTable;
