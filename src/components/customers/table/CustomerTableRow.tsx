import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { Customer, CustomerStatus } from '@/types/customer';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { useVoiceCall } from '@/hooks/useVoiceCall';

interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string, checked: boolean) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
  rowIndex: number;
}

const CustomerTableRow = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onManageTickets,
  rowIndex,
}: CustomerTableRowProps) => {
  const { makeCall, isCalling } = useVoiceCall();

  const handleStatusChange = (status: CustomerStatus) => {
    onStatusChange(customer.id, status);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
    }).format(date);
  };

  const handleCall = (event: React.MouseEvent) => {
    event.preventDefault();
    if (customer.phone) {
      makeCall({ phoneNumber: customer.phone, customerId: customer.id });
    }
  };

  return (
    <tr 
      className="hover:bg-gray-50 transition-colors duration-150 focus-within:bg-gray-50"
      role="row"
      aria-rowindex={rowIndex + 2} // +2 because header is row 1 and we start from 0
      tabIndex={-1}
    >
      <td 
        className="px-6 py-4 whitespace-nowrap"
        role="gridcell"
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
          aria-label={`Select customer ${customer.name}`}
          className="transition-colors"
        />
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        role="gridcell"
      >
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
            {customer.name}
          </div>
        </div>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        role="gridcell"
      >
        <div className="text-sm text-gray-900">
          <a 
            href={`mailto:${customer.email}`}
            className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label={`Email ${customer.name} at ${customer.email}`}
          >
            {customer.email}
          </a>
        </div>
        <div className="text-sm text-gray-500">
          {customer.phone ? (
            <button
              onClick={handleCall}
              disabled={isCalling}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Call ${customer.name} at ${customer.phone}`}
            >
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4 text-gray-400" />}
              <span>{customer.phone}</span>
            </button>
          ) : (
            <span className="text-gray-400">No phone</span>
          )}
        </div>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        role="gridcell"
      >
        <StatusSelector
          status={customer.status}
          onChange={handleStatusChange}
        />
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        role="gridcell"
      >
        <TicketIndicator
          tickets={customer.activeTickets || []}
          ticketCount={customer.ticketCount || 0}
        />
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        role="gridcell"
      >
        <time dateTime={customer.createdAt.toISOString()}>
          {formatDate(customer.createdAt)}
        </time>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
        role="gridcell"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Actions for customer ${customer.name}`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="w-48 bg-white shadow-lg border border-gray-200 animate-fade-in"
          >
            <DropdownMenuItem 
              onClick={() => onEdit(customer)}
              onKeyDown={(e) => handleKeyDown(e, () => onEdit(customer))}
              className="hover:bg-gray-50 transition-colors cursor-pointer focus:bg-gray-50"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onManageTickets(customer)}
              onKeyDown={(e) => handleKeyDown(e, () => onManageTickets(customer))}
              className="hover:bg-gray-50 transition-colors cursor-pointer focus:bg-gray-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Manage Tickets
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(customer.id)}
              onKeyDown={(e) => handleKeyDown(e, () => onDelete(customer.id))}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default CustomerTableRow;
