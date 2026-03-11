
import React from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import { useCustomerActions } from '../CustomerActions';
import CustomerTableContent from './CustomerTableContent';
import UnifiedToolbar from '../filters/UnifiedToolbar';
import BulkActionsBar from './BulkActionsBar';
import ErrorBoundary from '@/components/error/ErrorBoundary';

const CustomerTableContainer = React.memo(() => {
  const {
    customers,
    isLoading,
  } = useCustomerData();

  const {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
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

  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
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

  const {
    handleExportCSV,
    handleExportJSON,
    handleExportExcel,
  } = useCustomerExport({
    customers,
    filteredCustomers,
    selectedCustomers,
  });

  const {
    handleBulkStatusChange,
    handleBulkDelete,
  } = useCustomerActions();

  // Reset to page 1 when filters or page size change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange, ticketCountFilter, itemsPerPage]);

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

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <ErrorBoundary>
          <UnifiedToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            ticketFilter={ticketCountFilter}
            onTicketFilterChange={setTicketCountFilter}
            savedPresets={savedPresets}
            onApplyPreset={applyPreset}
            onSavePreset={saveCurrentAsPreset}
            onQuickDateRange={getQuickDateRange}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onExportExcel={handleExportExcel}
          />
        </ErrorBoundary>

        {selectedCustomers.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedCustomers.size}
            onClearSelection={clearSelection}
            onExport={handleExportCSV}
            onBulkStatusChange={(status) => {
              handleBulkStatusChange(selectedCustomers, status);
              clearSelection();
            }}
            onBulkDelete={() => {
              handleBulkDelete(selectedCustomers);
              clearSelection();
            }}
          />
        )}
        
        <ErrorBoundary>
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
            totalCount={filteredCustomers.length}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
});

CustomerTableContainer.displayName = 'CustomerTableContainer';

export default CustomerTableContainer;
