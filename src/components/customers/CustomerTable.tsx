
import React, { useState, useMemo } from 'react';
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
import AdvancedFilters from './AdvancedFilters';
import BulkActions from './BulkActions';
import CustomerMetrics from './CustomerMetrics';
import { toast } from '@/components/ui/use-toast';

const CustomerTable = () => {
  const { customers, updateCustomerStatus, deleteCustomer, createTicket, updateTicketStatus } = useCRM();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState('details');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [ticketFilter, setTicketFilter] = useState<string>('all');

  const pageSize = 10; // Increased page size for better UX
  
  // Enhanced filtering logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Status filter
      if (statusFilter !== 'all' && customer.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery && !customer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !customer.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !customer.phone.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Date range filter
      if (dateRange.start && customer.createdAt < dateRange.start) return false;
      if (dateRange.end && customer.createdAt > dateRange.end) return false;
      
      // Ticket filter
      switch (ticketFilter) {
        case 'with-tickets':
          if (customer.ticketCount === 0) return false;
          break;
        case 'no-tickets':
          if (customer.ticketCount > 0) return false;
          break;
        case 'urgent-tickets':
          if (!customer.activeTickets?.some(t => t.priority === 'urgent' && t.status !== 'closed')) return false;
          break;
        case 'open-tickets':
          if (!customer.activeTickets?.some(t => t.status === 'open' || t.status === 'in-progress')) return false;
          break;
      }
      
      return true;
    });
  }, [customers, statusFilter, searchQuery, dateRange, ticketFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ start: startDate, end: endDate });
    setCurrentPage(1);
  };

  const handleTicketFilterChange = (filter: string) => {
    setTicketFilter(filter);
    setCurrentPage(1);
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
    const selectedCustomerData = customers.filter(c => selectedCustomers.has(c.id));
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Created At', 'Ticket Count'].join(','),
      ...selectedCustomerData.map(c => [
        c.name,
        c.email,
        c.phone,
        c.status,
        c.createdAt.toLocaleDateString(),
        c.ticketCount.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${selectedCustomers.size} customer(s)`,
    });
  };

  const isAllSelected = currentCustomers.length > 0 && currentCustomers.every(c => selectedCustomers.has(c.id));
  const isPartiallySelected = currentCustomers.some(c => selectedCustomers.has(c.id)) && !isAllSelected;

  return (
    <div className="space-y-6">
      <CustomerMetrics customers={customers} />
      
      <AdvancedFilters 
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        onDateRangeChange={handleDateRangeChange}
        onTicketFilterChange={handleTicketFilterChange}
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
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onCheckedChange={handleSelectAll}
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
