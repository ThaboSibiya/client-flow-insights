
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import CustomerTableRow from './CustomerTableRow';
import CustomerPagination from './CustomerPagination';
import EnhancedFilters from './EnhancedFilters';
import BulkActions from './BulkActions';
import CustomerMetrics from './CustomerMetrics';
import QuickActionsBar from './QuickActionsBar';
import CustomerTableHeader from './CustomerTableHeader';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useCustomerExport } from './CustomerExportActions';
import { useCustomerActions } from './CustomerActions';

const CustomerTable = () => {
  const { customers } = useCRM();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use the custom filter hook
  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    ticketFilter,
    setTicketFilter,
    dateRange,
    setDateRange,
    filteredCustomers,
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    getQuickDateRange,
  } = useCustomerFilters(customers);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Table selection
  const {
    selectedItems: selectedCustomers,
    setSelectedItems: setSelectedCustomers,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  } = useTableSelection(currentCustomers);

  // Customer actions
  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    handleBulkStatusChange,
    handleBulkDelete,
    CustomerDialogs,
  } = useCustomerActions();

  // Export functionality
  const { handleExportCSV, handleExportJSON, handleExportExcel } = useCustomerExport({
    customers,
    filteredCustomers,
    selectedCustomers,
  });

  // Define keyboard shortcuts
  const shortcuts = useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      action: () => window.location.href = '/onboarding',
      description: 'New Customer',
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus Search',
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => handleExportCSV(),
      description: 'Export CSV',
    },
    {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      action: () => handleSelectAll(!isAllSelected),
      description: 'Select All',
    },
  ]);

  const handleQuickDateRange = (range: string) => {
    const newDateRange = getQuickDateRange(range);
    setDateRange(newDateRange);
    setCurrentPage(1);
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    handleSelectItem(customerId, checked);
  };

  // Bulk actions handlers
  const onBulkStatusChange = async (status: CustomerStatus) => {
    await handleBulkStatusChange(selectedCustomers, status);
    clearSelection();
  };

  const onBulkDelete = async () => {
    await handleBulkDelete(selectedCustomers);
    clearSelection();
  };

  const onBulkExport = () => {
    handleExportCSV();
  };

  return (
    <div className="space-y-6">
      <CustomerMetrics customers={customers} />
      
      <QuickActionsBar
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onExportExcel={handleExportExcel}
        shortcuts={shortcuts}
      />

      <EnhancedFilters 
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        ticketFilter={ticketFilter}
        onTicketFilterChange={setTicketFilter}
        savedPresets={savedPresets}
        onApplyPreset={applyPreset}
        onSavePreset={saveCurrentAsPreset}
        onQuickDateRange={handleQuickDateRange}
      />

      <BulkActions
        selectedCount={selectedCustomers.size}
        onBulkStatusChange={onBulkStatusChange}
        onBulkDelete={onBulkDelete}
        onBulkExport={onBulkExport}
        onClearSelection={clearSelection}
      />

      <div className="rounded-xl overflow-hidden border shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
        <Table>
          <CustomerTableHeader
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {currentCustomers.map((customer) => (
              <CustomerTableRow 
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomers.has(customer.id)}
                onSelect={(checked) => handleSelectCustomer(customer.id, checked)}
                onView={handleOpenCustomerDetails}
                onDelete={handleDeleteCustomer}
                onStatusChange={handleStatusChange}
                onManageTickets={handleManageTickets}
              />
            ))}
            
            {currentCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchQuery || statusFilter !== 'all' || ticketFilter !== 'all' || dateRange.start || dateRange.end
                    ? 'No customers match your filters' 
                    : 'No customers found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
