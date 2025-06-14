
import React from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import CustomerTableContent from './CustomerTableContent';
import CustomerTableFilters from './CustomerTableFilters';

const CustomerTableContainer = () => {
  const {
    customers,
    isLoading,
    error,
    refetch
  } = useCustomerData();

  const {
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedCustomers
  } = useCustomerFilters(customers);

  const {
    selectedItems: selectedCustomers,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  } = useTableSelection(paginatedCustomers.map(c => c.id));

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

  const handleSelectAll = (checked: boolean) => {
    handleSelectAll(checked);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-medium">Error loading customers</p>
        <p className="text-sm">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerTableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCount={selectedCustomers.size}
        onClearSelection={clearSelection}
      />
      
      <CustomerTableContent
        paginatedCustomers={paginatedCustomers}
        selectedCustomers={selectedCustomers}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectCustomer={handleSelectCustomer}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CustomerTableContainer;
