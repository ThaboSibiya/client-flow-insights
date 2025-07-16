
import React, { useState } from 'react';
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
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Customer } from '@/types/customer';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/components/ui/use-toast';

interface DeleteCustomerDialogProps {
    customer: Customer;
}

const DeleteCustomerDialog = ({ customer }: DeleteCustomerDialogProps) => {
    const { deleteCustomer } = useCRM();
    const { toast } = useToast();
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
    
    return (
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
    );
};

export default DeleteCustomerDialog;
