
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
    if (count === 0) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (count <= 2) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (count <= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'existing': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finalised': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
    <div className="flex items-center justify-end gap-2 min-w-[200px]">
      {/* Status Badge */}
      <Badge
        variant="outline"
        className={`text-xs font-medium px-2 py-1 ${getStatusBadgeColor(customer.status || 'new')}`}
      >
        {(customer.status || 'new').charAt(0).toUpperCase() + (customer.status || 'new').slice(1)}
      </Badge>

      {/* Ticket Badge */}
      <Badge 
        variant="outline"
        className={`text-xs font-medium px-2 py-1 cursor-pointer hover:shadow-sm transition-all ${getTicketBadgeColor(customer.ticketCount || 0)}`}
        onClick={() => onManageTickets(customer)}
      >
        {customer.ticketCount || 0} ticket{(customer.ticketCount || 0) !== 1 ? 's' : ''}
      </Badge>

      {/* Quick Contact Actions */}
      <div className="flex items-center gap-1">
        {customer.phone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCall}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Call customer"
          >
            <Phone className="h-3.5 w-3.5" />
          </Button>
        )}
        {customer.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmail}
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
            title="Email customer"
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors data-[state=open]:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white border border-slate-200 shadow-lg"
        >
          <DropdownMenuItem 
            onClick={() => onEdit(customer)}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onEdit(customer)}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
          >
            <Edit className="h-4 w-4 text-slate-500" />
            Edit Customer
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onManageTickets(customer)}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            Manage Tickets
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />

          <DropdownMenuItem 
            onClick={() => onDelete(customer.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomerTableActions;
