
import React, { useState } from 'react';
import { Customer } from '@/types/customer';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerActions } from './CustomerActions';
import CustomerTableHeader from './table/CustomerTableHeader';
import CustomerTableRow from './table/CustomerTableRow';
import CustomerPagination from './table/CustomerPagination';
import EnhancedFilters from './filters/EnhancedFilters';

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
}

const CustomerTable = ({ customers, loading = false }: CustomerTableProps) => {
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
    resetFilters,
    activeFilters,
    dateRange,
    setDateRange,
    ticketCountFilter,
    setTicketCountFilter,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
    savedPresets
  } = useCustomerFilters(customers);

  const {
    selectedCustomers,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectCustomer,
    clearSelection
  } = useTableSelection(filteredCustomers);

  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    handleBulkStatusChange,
    handleBulkDelete,
    CustomerDialogs,
  } = useCustomerActions();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterPresetLoad = (preset: any) => {
    loadFilterPreset(preset.id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onResetFilters={resetFilters}
        activeFilters={activeFilters}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        ticketCountFilter={ticketCountFilter}
        onTicketCountFilterChange={setTicketCountFilter}
        onSavePreset={saveFilterPreset}
        onLoadPreset={handleFilterPresetLoad}
        onDeletePreset={deleteFilterPreset}
        savedPresets={savedPresets}
        selectedCount={selectedCustomers.size}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CustomerTableHeader
              isAllSelected={isAllSelected}
              isIndeterminate={isIndeterminate}
              onSelectAll={handleSelectAll}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field) => {
                if (sortBy === field) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(field);
                  setSortOrder('asc');
                }
              }}
            />
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <CustomerTableRow
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedCustomers.has(customer.id)}
                  onSelect={handleSelectCustomer}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenCustomerDetails}
                  onDelete={handleDeleteCustomer}
                  onManageTickets={handleManageTickets}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <CustomerPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
      />

      <CustomerDialogs />
    </div>
  );
};

export default CustomerTable;
