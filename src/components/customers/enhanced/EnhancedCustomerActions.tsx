
import React, { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/error/ErrorBoundary';

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
  const { deleteCustomer } = useCRM();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContact = (method: 'email' | 'phone') => {
    if (method === 'email' && customer.email) {
      window.location.href = `mailto:${customer.email}`;
    } else if (method === 'phone' && customer.phone) {
      window.location.href = `tel:${customer.phone}`;
    } else {
      toast({
        title: "Contact information missing",
        description: `No ${method} address found for this customer`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'existing': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'finalised': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <Badge className={`${getStatusColor(customer.status)} capitalize`}>
          {customer.status}
        </Badge>

        {/* Quick Actions */}
        <div className="flex items-center">
          {customer.email && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleContact('email')}
              className="h-8 w-8 p-0"
              title={`Email ${customer.name}`}
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}

          {customer.phone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleContact('phone')}
              className="h-8 w-8 p-0"
              title={`Call ${customer.name}`}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}

          {/* Ticket indicator */}
          {customer.ticketCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageTickets(customer)}
              className="h-8 w-8 p-0 relative"
              title={`${customer.ticketCount} ticket(s)`}
            >
              <FileText className="h-4 w-4" />
              {customer.ticketCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {customer.ticketCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* More Actions Dropdown */}
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

            {/* Status Change Options */}
            {customer.status !== 'new' && (
              <DropdownMenuItem onClick={() => onStatusChange(customer.id, 'new')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as New
              </DropdownMenuItem>
            )}

            {customer.status !== 'existing' && (
              <DropdownMenuItem onClick={() => onStatusChange(customer.id, 'existing')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as Existing
              </DropdownMenuItem>
            )}

            {customer.status !== 'pending' && (
              <DropdownMenuItem onClick={() => onStatusChange(customer.id, 'pending')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
            )}

            {customer.status !== 'finalised' && (
              <DropdownMenuItem onClick={() => onStatusChange(customer.id, 'finalised')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as Finalised
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Delete Action with Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Customer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Customer
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{customer.name}</strong>? 
                    This action cannot be undone and will also delete all associated tickets and data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Customer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedCustomerActions;
