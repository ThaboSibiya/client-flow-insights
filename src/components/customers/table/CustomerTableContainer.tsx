
import React from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import CustomerTableContent from './CustomerTableContent';
import CustomerTableFilters from './CustomerTableFilters';

const CustomerTableContainer = () => {
  const {
    customers,
    setCustomers
  } = useCustomerData();

  const {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    ticketCountFilter,
    setTicketCountFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    pagination,
    setPagination,
    paginatedCustomers,
    savedPresets,
    applyPreset,
    savePreset,
    getQuickDateRange
  } = useCustomerFilters(customers);

  const {
    selectedItems: selectedCustomers,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  } = useTableSelection(paginatedCustomers);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    handleSelectItem(customerId, checked);
  };

  return (
    <div className="space-y-6">
      <CustomerTableFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        ticketCountFilter={ticketCountFilter}
        onTicketCountFilterChange={setTicketCountFilter}
        savedPresets={savedPresets}
        onApplyPreset={applyPreset}
        onSavePreset={savePreset}
        onQuickDateRange={getQuickDateRange}
      />
      
      <CustomerTableContent
        paginatedCustomers={paginatedCustomers}
        selectedCustomers={selectedCustomers}
        isAllSelected={isAllSelected}
        isIndeterminate={isPartiallySelected}
        onSelectAll={handleSelectAll}
        onSelectCustomer={handleSelectCustomer}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        currentPage={pagination.page}
        totalPages={Math.ceil(filteredCustomers.length / pagination.pageSize)}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        isLoading={false}
      />
    </div>
  );
};

export default CustomerTableContainer;
