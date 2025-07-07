
import React, { useCallback, useTransition } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters/index';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import DynamicCustomerTableOptimized from './DynamicCustomerTableOptimized';
import CustomerTableFiltersOptimized from './CustomerTableFiltersOptimized';
import QuickActionsBar from '../QuickActionsBar';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { toast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

const CustomerTableContainerOptimized = () => {
  const [isPending, startTransition] = useTransition();
  const {
    customers,
    isLoading,
    refreshCustomers,
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
    getQuickDateRange,
    resetFilters,
    activeFilters
  } = useCustomerFilters(customers);

  const [searchInput, setSearchInput] = React.useState(searchQuery);
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  React.useEffect(() => {
    startTransition(() => {
      setSearchQuery(debouncedSearchQuery);
    });
  }, [debouncedSearchQuery, setSearchQuery]);

  React.useEffect(() => {
    if (searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery, searchInput]);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const {
    selectedItems: selectedCustomers,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleSelectItem,
    clearSelection
  } = useTableSelection(filteredCustomers);

  const {
    handleExportCSV,
    handleExportJSON,
    handleExportExcel,
  } = useCustomerExport({
    customers,
    filteredCustomers,
    selectedCustomers,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshCustomers();
      toast({
        title: "Data refreshed",
        description: "Customer data has been updated successfully.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh failed",
        description: "An error occurred while refreshing data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCustomers]);

  const handleClearAllFilters = useCallback(() => {
    startTransition(() => {
      resetFilters();
      setSearchInput('');
    });
    toast({
      title: "Filters cleared",
      description: "All filters have been reset to default values.",
    });
  }, [resetFilters]);

  const shortcuts = useKeyboardShortcuts([
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => handleSelectAll(!isAllSelected),
      description: 'Select all customers'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: handleExportCSV,
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
    },
    {
      key: 'r',
      ctrlKey: true,
      action: handleRefresh,
      description: 'Refresh data'
    }
  ]);

  // Effect for initial data load and refresh
  React.useEffect(() => {
    const justOnboarded = sessionStorage.getItem('justOnboarded');
    
    if (justOnboarded || (customers.length === 0 && !isLoading)) {
      refreshCustomers();
      if (justOnboarded) {
        sessionStorage.removeItem('justOnboarded');
      }
    }
  }, [refreshCustomers, customers.length, isLoading]);

  // Listen for focus events to refresh data
  React.useEffect(() => {
    const handleFocus = () => refreshCustomers();
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshCustomers();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCustomers]);

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
          <CustomerTableFiltersOptimized
            searchQuery={searchInput}
            onSearchQueryChange={setSearchInput}
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
            activeFilters={activeFilters}
            onClearAllFilters={handleClearAllFilters}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <DynamicCustomerTableOptimized
            customers={filteredCustomers}
            onCustomerClick={(customer) => {
              console.log('Customer clicked:', customer.name);
            }}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerTableContainerOptimized;
