
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
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    getQuickDateRange
  } = useCustomerFilters(customers);

  // Add pagination state since it's not in the hook
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  // Calculate paginated customers
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

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
        onSavePreset={saveCurrentAsPreset}
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
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={false}
      />
    </div>
  );
};

export default CustomerTableContainer;
