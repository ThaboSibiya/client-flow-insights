
import React from 'react';
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
    <div className="flex items-center justify-end gap-2 min-w-[120px]">
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
