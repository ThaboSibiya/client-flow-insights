import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import CustomerDetailsDialog from './CustomerDetailsDialog';
import CustomerTableRow from './CustomerTableRow';
import CustomerPagination from './CustomerPagination';
import TicketManagementDialog from './TicketManagementDialog';
import EnhancedFilters from './EnhancedFilters';
import BulkActions from './BulkActions';
import CustomerMetrics from './CustomerMetrics';
import QuickActionsBar from './QuickActionsBar';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportCustomers } from '@/utils/exportUtils';
import { toast } from '@/components/ui/use-toast';

const CustomerTable = () => {
  const { customers, updateCustomerStatus, deleteCustomer, createTicket, updateTicketStatus } = useCRM();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState('details');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

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
      action: () => document.querySelector('input[placeholder*="Search"]')?.focus(),
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

  // Export functions
  const handleExportCSV = () => {
    const dataToExport = selectedCustomers.size > 0 
      ? customers.filter(c => selectedCustomers.has(c.id))
      : filteredCustomers;
    
    exportCustomers({
      customers: dataToExport,
      format: 'csv',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as CSV`,
    });
  };

  const handleExportJSON = () => {
    const dataToExport = selectedCustomers.size > 0 
      ? customers.filter(c => selectedCustomers.has(c.id))
      : filteredCustomers;
    
    exportCustomers({
      customers: dataToExport,
      format: 'json',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as JSON`,
    });
  };

  const handleExportExcel = () => {
    const dataToExport = selectedCustomers.size > 0 
      ? customers.filter(c => selectedCustomers.has(c.id))
      : filteredCustomers;
    
    exportCustomers({
      customers: dataToExport,
      format: 'excel',
    });
    
    toast({
      title: "Success",
      description: `Exported ${dataToExport.length} customer(s) as Excel`,
    });
  };

  const handleQuickDateRange = (range: string) => {
    const dateRange = getQuickDateRange(range);
    setDateRange(dateRange);
    setCurrentPage(1);
  };

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus) => {
    updateCustomerStatus(customerId, newStatus);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
      setSelectedCustomers(prev => {
        const newSet = new Set(prev);
        newSet.delete(customerId);
        return newSet;
      });
    }
  };

  const handleOpenCustomerDetails = (customer: Customer, tab = 'details') => {
    setSelectedCustomer(customer);
    setActiveDialogTab(tab);
    setIsFormOpen(true);
  };

  const handleManageTickets = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsTicketDialogOpen(true);
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(currentCustomers.map(c => c.id)));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: CustomerStatus) => {
    const promises = Array.from(selectedCustomers).map(id => updateCustomerStatus(id, status));
    await Promise.all(promises);
    setSelectedCustomers(new Set());
    toast({
      title: "Success",
      description: `Updated ${selectedCustomers.size} customer(s) to ${status}`,
    });
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?`)) {
      const promises = Array.from(selectedCustomers).map(id => deleteCustomer(id));
      await Promise.all(promises);
      setSelectedCustomers(new Set());
      toast({
        title: "Success",
        description: `Deleted ${selectedCustomers.size} customer(s)`,
      });
    }
  };

  const handleBulkExport = () => {
    handleExportCSV();
  };

  const isAllSelected = currentCustomers.length > 0 && currentCustomers.every(c => selectedCustomers.has(c.id));
  const isPartiallySelected = currentCustomers.some(c => selectedCustomers.has(c.id)) && !isAllSelected;

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
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onClearSelection={() => setSelectedCustomers(new Set())}
      />

      <div className="rounded-xl overflow-hidden border shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  indeterminate={isPartiallySelected}
                />
              </TableHead>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Phone</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Tickets</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.map((customer) => (
              <CustomerTableRow 
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomers.has(customer.id)}
                onSelect={(checked) => handleSelectCustomer(customer.id, checked)}
                onView={(customer) => handleOpenCustomerDetails(customer)}
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

      <CustomerDetailsDialog 
        customer={selectedCustomer} 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
          setActiveDialogTab('details');
        }} 
      />

      <TicketManagementDialog 
        customer={selectedCustomer}
        isOpen={isTicketDialogOpen}
        onClose={() => {
          setIsTicketDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onCreateTicket={createTicket}
        onUpdateTicketStatus={updateTicketStatus}
      />
    </div>
  );
};

export default CustomerTable;
