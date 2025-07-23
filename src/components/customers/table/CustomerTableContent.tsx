
import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpDown, 
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
import { useCustomerActions, CustomerActionDialogs } from '../actions/CustomerActions';
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? 
      <ArrowUpDown className="h-4 w-4 text-blue-600" /> : 
      <ArrowUpDown className="h-4 w-4 text-blue-600 rotate-180" />;
  };

  // Custom checkbox component to handle indeterminate state
  const SelectAllCheckbox = () => {
    const checkboxRef = React.useRef<HTMLButtonElement>(null);
    
    React.useEffect(() => {
      if (checkboxRef.current) {
        const checkboxElement = checkboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkboxElement) {
          checkboxElement.indeterminate = isIndeterminate;
        }
      }
    }, [isIndeterminate]);

    return (
      <Checkbox
        ref={checkboxRef}
        checked={isAllSelected}
        onCheckedChange={onSelectAll}
      />
    );
  };

  if (isLoading) {
    return <CustomerTableSkeleton />;
  }

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 px-4 py-3">
                  <SelectAllCheckbox />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort('name')}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    Name {getSortIcon('name')}
                  </Button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort('email')}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    Email {getSortIcon('email')}
                  </Button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort('status')}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    Status {getSortIcon('status')}
                  </Button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort('ticketCount')}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    Tickets {getSortIcon('ticketCount')}
                  </Button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-900">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort('createdAt')}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    Created {getSortIcon('createdAt')}
                  </Button>
                </th>
                <th className="w-16 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedCustomers.has(customer.id)}
                      onCheckedChange={(checked) => 
                        onSelectCustomer(customer.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.ticketCount || 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenCustomerDetails(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenCustomerDetails(customer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageTickets(customer)}>
                          <Ticket className="mr-2 h-4 w-4" />
                          Manage Tickets
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, paginatedCustomers.length)} of {paginatedCustomers.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
