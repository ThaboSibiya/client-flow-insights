
import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomerActions } from '../CustomerActions';
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
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
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
  itemsPerPage = 10,
  onItemsPerPageChange,
}: CustomerTableContentProps) => {
  const {
    handleStatusChange,
    handleDeleteCustomer,
    handleOpenCustomerDetails,
    handleManageTickets,
    CustomerDialogs,
  } = useCustomerActions();

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
        "text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors select-none",
        sortBy === field && "text-primary",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          <span className="text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {paginatedCustomers.length === 0 ? (
          <CustomerEmptyState hasFilters={totalCount === 0} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-b border-border hover:bg-muted/30">
                    <TableHead className="w-10 px-3">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={onSelectAll}
                        className="data-[state=checked]:bg-primary"
                        aria-label="Select all customers"
                      />
                    </TableHead>
                    <SortableHeader field="name">Name</SortableHeader>
                    <SortableHeader field="email">Contact</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tickets</TableHead>
                    <SortableHeader field="createdAt" className="hidden lg:table-cell">Added</SortableHeader>
                    <TableHead className="w-12" />
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {startIndex}–{endIndex} of {totalCount}
                </p>
                {onItemsPerPageChange && (
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(v) => onItemsPerPageChange(Number(v))}
                  >
                    <SelectTrigger className="h-7 w-[70px] text-xs border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50].map((n) => (
                        <SelectItem key={n} value={String(n)} className="text-xs">
                          {n} rows
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-7 w-7 p-0 text-muted-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page buttons */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={cn(
                        "h-7 w-7 p-0 text-xs",
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-7 w-7 p-0 text-muted-foreground disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <CustomerDialogs />
    </>
  );
};

export default CustomerTableContent;
