
import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomerActions, CustomerActionDialogs } from '../actions/CustomerActions';
import CustomerTableRow from './CustomerTableRow';
import CustomerTableSkeleton from './CustomerTableSkeleton';
import CustomerEmptyState from './CustomerEmptyState';
import { cn } from '@/lib/utils';

interface CustomerTableContentProps {
  paginatedCustomers: Customer[];
  selectedCustomers: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectCustomer: (customerId: string, checked: boolean) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const CustomerTableContent = ({
  paginatedCustomers,
  selectedCustomers,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectCustomer,
  sortBy,
  sortOrder,
  onSort,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  isLoading,
}: CustomerTableContentProps) => {
  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    handleCreateTicket,
    handleUpdateTicketStatus,
    handleAddTimeEntry,
    selectedCustomer,
    isFormOpen,
    isTicketDialogOpen,
    closeDetailsDialog,
    closeTicketDialog,
  } = useCustomerActions();

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  const SortableHeader = ({ 
    field, 
    children, 
    className 
  }: { 
    field: string; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <TableHead 
      className={cn(
        "text-xs font-medium text-quikle-slate uppercase tracking-wide cursor-pointer hover:text-quikle-charcoal transition-colors select-none",
        sortBy === field && "text-quikle-primary",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <span className="text-quikle-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <>
      <div className="bg-white rounded-lg border border-quikle-silver/20 shadow-sm overflow-hidden">
        {paginatedCustomers.length === 0 ? (
          <CustomerEmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-quikle-crystal/30 border-b border-quikle-silver/20 hover:bg-quikle-crystal/30">
                    <TableHead className="w-10 px-3">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={onSelectAll}
                        className="border-quikle-silver data-[state=checked]:bg-quikle-primary"
                        aria-label="Select all customers"
                      />
                    </TableHead>
                    <SortableHeader field="name">Name</SortableHeader>
                    <SortableHeader field="email">Contact</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <TableHead className="text-xs font-medium text-quikle-slate uppercase tracking-wide">Tickets</TableHead>
                    <SortableHeader field="createdAt" className="hidden lg:table-cell">Added</SortableHeader>
                    <TableHead className="w-32 text-right text-xs font-medium text-quikle-slate uppercase tracking-wide pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer, index) => (
                    <CustomerTableRow
                      key={customer.id}
                      customer={customer}
                      isSelected={selectedCustomers.has(customer.id)}
                      onSelect={(id, checked) => onSelectCustomer(id, checked)}
                      onEdit={handleOpenCustomerDetails}
                      onDelete={handleDeleteCustomer}
                      onStatusChange={handleStatusChange}
                      onManageTickets={handleManageTickets}
                      rowIndex={index}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Minimal Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-quikle-silver/20 bg-quikle-crystal/10">
              <p className="text-xs text-quikle-slate">
                {startIndex}–{endIndex} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-quikle-slate hover:text-quikle-charcoal disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-quikle-charcoal font-medium px-2">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-7 px-2 text-quikle-slate hover:text-quikle-charcoal disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <CustomerActionDialogs
        selectedCustomer={selectedCustomer}
        isFormOpen={isFormOpen}
        isTicketDialogOpen={isTicketDialogOpen}
        onCloseDetailsDialog={closeDetailsDialog}
        onCloseTicketDialog={closeTicketDialog}
        onCreateTicket={handleCreateTicket}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onAddTimeEntry={handleAddTimeEntry}
      />
    </>
  );
};

export default CustomerTableContent;
