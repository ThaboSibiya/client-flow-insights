
import React from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CustomerTableContent from './CustomerTableContent';
import CustomerTableFilters from './CustomerTableFilters';
import QuickActionsBar from '../QuickActionsBar';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { toast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = React.useState(false);
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

  // Export functionality
  const {
    handleExportCSV,
    handleExportJSON,
    handleExportExcel,
  } = useCustomerExport({
    customers,
    filteredCustomers,
    selectedCustomers,
  });

  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts([
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        handleSelectAll(!isAllSelected);
      },
      description: 'Select all customers'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        handleExportCSV();
      },
      description: 'Export as CSV'
    },
    {
      key: 'Escape',
      action: () => {
        if (selectedCustomers.size > 0) {
          clearSelection();
          toast({
            title: "Selection cleared",
            description: "All customer selections have been cleared",
          });
        }
      },
      description: 'Clear selection'
    }
  ]);

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

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate refresh - in real app this would refetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Data refreshed",
        description: "Customer data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <QuickActionsBar
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onExportExcel={handleExportExcel}
          shortcuts={shortcuts}
        />
        
        <ErrorBoundary>
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
        </ErrorBoundary>
        
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
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerTableContainer;
