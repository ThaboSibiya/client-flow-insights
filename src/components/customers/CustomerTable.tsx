
import React, { useState, lazy, Suspense } from 'react';
import { Customer } from '@/types/customer';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerActions } from './actions/CustomerActions';
import { useCustomerBulkActions } from '@/hooks/useCustomerBulkActions';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import { useCRM } from '@/context/CRMContext';
import CustomerTableHeader from './table/CustomerTableHeader';
import CustomerTableRow from './table/CustomerTableRow';
import CustomerPagination from './table/CustomerPagination';
import BulkActions from './actions/BulkActions';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components for better code splitting
const EnhancedFilters = lazy(() => import('./filters/EnhancedFilters'));
const TicketManagementDialog = lazy(() => import('./TicketManagementDialog'));

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

  const { handleBulkStatusChange, handleBulkDelete } = useCustomerBulkActions();

  const { handleExportCSV, handleExportJSON, handleExportExcel } = useCustomerExport({
    customers,
    filteredCustomers,
    selectedCustomers,
  });

  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    CustomerDialogs,
  } = useCustomerActions();

  // Memoized pagination calculations for performance
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const paginationData = React.useMemo(() => {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      totalPages,
      startIndex,
      paginatedCustomers
    };
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleFilterPresetLoad = React.useCallback((preset: any) => {
    loadFilterPreset(preset.id);
  }, [loadFilterPreset]);

  const handleBulkExport = React.useCallback(() => {
    handleExportCSV(); // Default to CSV for bulk export
  }, [handleExportCSV]);

  const FiltersSkeleton = React.memo(() => (
    <div className="p-6 bg-white border rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  ));

  const TicketDialogSkeleton = React.memo(() => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh]">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      <Suspense fallback={<FiltersSkeleton />}>
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
      </Suspense>

      <BulkActions
        selectedCount={selectedCustomers.size}
        onBulkStatusChange={(status) => handleBulkStatusChange(selectedCustomers, status)}
        onBulkDelete={() => handleBulkDelete(selectedCustomers)}
        onBulkExport={handleBulkExport}
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
              {paginationData.paginatedCustomers.map((customer) => (
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
        totalPages={paginationData.totalPages}
        onPageChange={setCurrentPage}
      />

      <Suspense fallback={<TicketDialogSkeleton />}>
        <CustomerDialogs />
      </Suspense>
    </div>
  );
};

export default CustomerTable;
