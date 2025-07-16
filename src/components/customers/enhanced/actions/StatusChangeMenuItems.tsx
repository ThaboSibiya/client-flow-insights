
import React from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Clock } from 'lucide-react';
import { Customer, CustomerStatus } from '@/types/customer';

interface StatusChangeMenuItemsProps {
  customer: Customer;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
}

const statusOptions: CustomerStatus[] = ['new', 'existing', 'pending', 'finalised'];

const StatusChangeMenuItems = ({ customer, onStatusChange }: StatusChangeMenuItemsProps) => {
  return (
    <>
      {statusOptions
        .filter(status => status !== customer.status)
        .map(status => (
          <DropdownMenuItem key={status} onClick={() => onStatusChange(customer.id, status)}>
            <Clock className="mr-2 h-4 w-4" />
            Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
          </DropdownMenuItem>
        ))}
    </>
  );
};

export default StatusChangeMenuItems;
