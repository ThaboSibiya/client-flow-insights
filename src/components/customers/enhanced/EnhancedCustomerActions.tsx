
import React from 'react';
import { Customer, CustomerStatus } from '@/context/CRMContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  FileText,
} from 'lucide-react';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import CustomerStatusBadge from './actions/CustomerStatusBadge';
import QuickContactButtons from './actions/QuickContactButtons';
import TicketIndicatorButton from './actions/TicketIndicatorButton';
import StatusChangeMenuItems from './actions/StatusChangeMenuItems';
import DeleteCustomerDialog from './actions/DeleteCustomerDialog';

interface EnhancedCustomerActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onManageTickets: (customer: Customer) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
}

const EnhancedCustomerActions = ({
  customer,
  onEdit,
  onManageTickets,
  onStatusChange
}: EnhancedCustomerActionsProps) => {

  return (
    <ErrorBoundary>
      <div className="flex items-center gap-2">
        <CustomerStatusBadge status={customer.status} />

        <div className="flex items-center">
          <QuickContactButtons customer={customer} />
          <TicketIndicatorButton customer={customer} onManageTickets={onManageTickets} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onManageTickets(customer)}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Tickets
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <StatusChangeMenuItems customer={customer} onStatusChange={onStatusChange} />

            <DropdownMenuSeparator />

            <DeleteCustomerDialog customer={customer} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedCustomerActions;
