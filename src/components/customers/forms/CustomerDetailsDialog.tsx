
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from '@/context/CRMContext';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details - {customer.name}</DialogTitle>
        </DialogHeader>
        <CustomerDetailsForm customer={customer} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
