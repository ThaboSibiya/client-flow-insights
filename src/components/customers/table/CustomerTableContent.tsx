
import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Ticket, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { useCustomerActions, CustomerActionDialogs } from '../actions/CustomerActions';
import { useDynamicTableColumns } from '@/hooks/useDynamicTableColumns';
import DynamicTableHeader from './DynamicTableHeader';
import DynamicTableCell from './DynamicTableCell';
import CustomerTableSkeleton from './CustomerTableSkeleton';

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

  const { columns, getColumnValue, getVisibleColumns } = useDynamicTableColumns(paginatedCustomers);
  
  // Detect screen size (simplified)
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleColumns = getVisibleColumns(screenSize);

  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-quikle-silver/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <DynamicTableHeader
                columns={visibleColumns}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                isAllSelected={isAllSelected}
                onSelectAll={onSelectAll}
                screenSize={screenSize}
              />
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-quikle-silver/20 hover:bg-quikle-crystal/20 transition-colors">
                  <td className="px-4 py-3 w-12">
                    <Checkbox
                      checked={selectedCustomers.has(customer.id)}
                      onCheckedChange={(checked) => 
                        onSelectCustomer(customer.id, checked as boolean)
                      }
                      className="border-quikle-silver data-[state=checked]:bg-quikle-primary"
                    />
                  </td>
                  
                  {visibleColumns.map((column) => (
                    <DynamicTableCell
                      key={column.key}
                      customer={customer}
                      columnKey={column.key}
                      columnType={column.type}
                      value={getColumnValue(customer, column.key)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  
                  <td className="px-4 py-3 w-16">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-quikle-crystal">
                          <MoreHorizontal className="h-4 w-4 text-quikle-slate" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-quikle-silver/30 shadow-lg">
                        <DropdownMenuItem onClick={() => handleOpenCustomerDetails(customer)}>
                          <Eye className="mr-2 h-4 w-4 text-quikle-primary" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenCustomerDetails(customer)}>
                          <Edit className="mr-2 h-4 w-4 text-quikle-secondary" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageTickets(customer)}>
                          <Ticket className="mr-2 h-4 w-4 text-quikle-accent" />
                          Manage Tickets
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-quikle-silver/30 bg-quikle-crystal/20">
          <div className="text-sm text-quikle-slate">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, paginatedCustomers.length)} of {paginatedCustomers.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-quikle-charcoal font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
