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
import { useDebounce } from '@/hooks/useDebounce';

const CustomerTableContainer = () => {
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
    getQuickDateRange
  } = useCustomerFilters(customers);

  // State for the search input, which updates instantly
  const [searchInput, setSearchInput] = React.useState(searchQuery);
  // Debounced version of the search input, which is used for filtering
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  // Effect to apply the debounced search query to the filters
  React.useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  // Effect to sync the search input if the query changes from elsewhere (e.g., presets)
  React.useEffect(() => {
    if (searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery, searchInput]);

  // Effect to refresh data when component mounts or when coming from onboarding
  React.useEffect(() => {
    console.log('CustomerTableContainer mounted, current customers:', customers.length);
    
    // Check if we came from onboarding by looking at the URL or session storage
    const justOnboarded = sessionStorage.getItem('justOnboarded');
    
    if (justOnboarded || (customers.length === 0 && !isLoading)) {
      console.log('Triggering refresh - just onboarded or no customers');
      refreshCustomers();
      
      // Clear the onboarding flag
      if (justOnboarded) {
        sessionStorage.removeItem('justOnboarded');
      }
    }
  }, []);

  // Listen for focus events to refresh data when user returns to tab
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing customer data');
      refreshCustomers();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab visible, refreshing customer data');
        refreshCustomers();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshCustomers]);

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
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        handleRefresh();
      },
      description: 'Refresh data'
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
    setIsRefreshing(true);
    try {
      console.log('Manual refresh triggered from table container');
      await refreshCustomers();
      toast({
        title: "Data refreshed",
        description: "Customer data has been updated successfully.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh failed",
        description: "An error occurred while trying to refresh.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
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
            isLoading={isLoading || isRefreshing}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerTableContainer;
