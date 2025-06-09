
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? `Edit ${customer.name}` : 'Customer Details'}
          </DialogTitle>
        </DialogHeader>
        {customer && (
          <CustomerDetailsForm 
            customer={customer}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
