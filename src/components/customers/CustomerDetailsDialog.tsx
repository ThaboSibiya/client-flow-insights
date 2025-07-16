
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Details - {customer.name}</DialogTitle>
        </DialogHeader>
        <CustomerDetailsForm customer={customer} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
