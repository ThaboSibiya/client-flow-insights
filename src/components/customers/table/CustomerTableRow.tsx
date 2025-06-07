
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Customer, CustomerStatus } from '@/context/CRMContext';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';

interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onView: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onManageTickets: (customer: Customer) => void;
}

const CustomerTableRow = ({
  customer,
  isSelected,
  onSelect,
  onView,
  onDelete,
  onStatusChange,
  onManageTickets
}: CustomerTableRowProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <TableRow className="hover:bg-gray-50/50 transition-colors group">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${customer.name}`}
        />
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.company}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="text-sm text-gray-900">{customer.email}</div>
          <div className="text-sm text-gray-500">{customer.phone}</div>
        </div>
      </TableCell>
      <TableCell>
        <StatusSelector
          currentStatus={customer.status}
          onStatusChange={(status) => onStatusChange(customer.id, status)}
          customerId={customer.id}
        />
      </TableCell>
      <TableCell>
        <TicketIndicator 
          tickets={customer.tickets} 
          onClick={() => onManageTickets(customer)}
        />
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {formatDate(customer.createdAt)}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {formatDate(customer.updatedAt)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(customer)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTickets(customer)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(customer.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
