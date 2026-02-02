
import React from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import CustomerTableContent from './CustomerTableContent';
import UnifiedToolbar from '../filters/UnifiedToolbar';
import BulkActionsBar from './BulkActionsBar';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { toast } from '@/hooks/use-toast';

const CustomerTableContainer = React.memo(() => {
  const {
    customers,
    isLoading,
    fetchCustomers,
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

  const [currentPage, setCurrentPage] = React.useState(1);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const itemsPerPage = 10;
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

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange, ticketCountFilter]);

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
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Unified Toolbar */}
        <ErrorBoundary>
          <UnifiedToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
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

        {/* Bulk Actions Bar - Shows when items selected */}
        {selectedCustomers.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedCustomers.size}
            onClearSelection={clearSelection}
            onExport={handleExportCSV}
          />
        )}
        
        {/* Table Content */}
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
            isLoading={isLoading || isRefreshing}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
});

CustomerTableContainer.displayName = 'CustomerTableContainer';

export default CustomerTableContainer;
