
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Trash2,
  Eye,
  Phone,
  Mail
} from 'lucide-react';
import { Customer } from '@/types/customer';

interface CustomerTableActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onManageTickets: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

const CustomerTableActions = ({ 
  customer, 
  onEdit, 
  onManageTickets, 
  onDelete 
}: CustomerTableActionsProps) => {
  const getTicketBadgeColor = (count: number) => {
    if (count === 0) return 'secondary';
    if (count <= 2) return 'default';
    if (count <= 5) return 'outline';
    return 'destructive';
  };

  const handleCall = () => {
    if (customer.phone) {
      window.open(`tel:${customer.phone}`, '_self');
    }
  };

  const handleEmail = () => {
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_self');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Contact Actions */}
      <div className="flex items-center gap-1">
        {customer.phone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCall}
            className="h-8 w-8 p-0 hover:bg-blue-50"
            title="Call customer"
          >
            <Phone className="h-3 w-3 text-blue-600" />
          </Button>
        )}
        {customer.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmail}
            className="h-8 w-8 p-0 hover:bg-green-50"
            title="Email customer"
          >
            <Mail className="h-3 w-3 text-green-600" />
          </Button>
        )}
      </div>

      {/* Ticket Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={getTicketBadgeColor(customer.ticketCount || 0)}
          className="text-xs cursor-pointer"
          onClick={() => onManageTickets(customer)}
        >
          {customer.ticketCount || 0} tickets
        </Badge>
        {customer.ticketCount && customer.ticketCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTickets(customer)}
            className="h-6 w-6 p-0"
            title="Manage tickets"
          >
            <FileText className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Status Badge */}
      <Badge
        variant={
          customer.status === 'new' ? 'default' :
          customer.status === 'existing' ? 'secondary' :
          customer.status === 'pending' ? 'outline' : 'destructive'
        }
        className="capitalize"
      >
        {customer.status}
      </Badge>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onEdit(customer)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onEdit(customer)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onManageTickets(customer)}>
            <FileText className="mr-2 h-4 w-4" />
            Manage Tickets
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => onDelete(customer.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomerTableActions;
