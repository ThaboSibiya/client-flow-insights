
import React, { useState } from 'react';
import { Customer } from '@/types/customer';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerActions } from './actions/CustomerActions';
import { useCRM } from '@/context/CRMContext';
import CustomerTableHeader from './table/CustomerTableHeader';
import CustomerTableRow from './table/CustomerTableRow';
import CustomerPagination from './table/CustomerPagination';
import EnhancedFilters from './filters/EnhancedFilters';

const CustomerTable = () => {
  const { customers } = useCRM();
  
  const {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
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
    selectedItems: selectedCustomers,
    isAllSelected,
    isPartiallySelected: isIndeterminate,
    handleSelectAll,
    handleSelectItem: handleSelectCustomer,
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

  return (
    <div className="space-y-6">
      <EnhancedFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        ticketFilter={ticketCountFilter}
        onTicketFilterChange={setTicketCountFilter}
        savedPresets={savedPresets}
        onApplyPreset={handleFilterPresetLoad}
        onSavePreset={saveFilterPreset}
        onQuickDateRange={(range) => {
          const newRange = { start: null, end: null };
          const now = new Date();
          switch (range) {
            case 'today':
              newRange.start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              newRange.end = now;
              break;
            case 'week':
              newRange.start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              newRange.end = now;
              break;
            case 'month':
              newRange.start = new Date(now.getFullYear(), now.getMonth(), 1);
              newRange.end = now;
              break;
            case 'quarter':
              const quarter = Math.floor(now.getMonth() / 3);
              newRange.start = new Date(now.getFullYear(), quarter * 3, 1);
              newRange.end = now;
              break;
          }
          setDateRange(newRange);
        }}
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
      />

      <CustomerDialogs />
    </div>
  );
};

export default CustomerTable;
