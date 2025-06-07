
import React from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Ticket } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';

interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string, selected: boolean) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
}

const CustomerTableRow = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onManageTickets,
}: CustomerTableRowProps) => {
  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
          aria-label={`Select ${customer.name}`}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-broker-primary to-broker-accent flex items-center justify-center text-white font-medium">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.email}</div>
        <div className="text-sm text-gray-500">{customer.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusSelector
          status={customer.status}
          onStatusChange={(status) => onStatusChange(customer.id, status)}
          customerId={customer.id}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <TicketIndicator
          tickets={customer.activeTickets || []}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(customer)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTickets(customer)}
            className="text-green-600 hover:text-green-900"
          >
            <Ticket className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(customer.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerTableRow;
