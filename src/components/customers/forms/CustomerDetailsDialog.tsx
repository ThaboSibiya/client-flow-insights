
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
      <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <DialogHeader className="border-b border-quikle-silver/20 pb-4">
          <DialogTitle className="text-2xl bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
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
