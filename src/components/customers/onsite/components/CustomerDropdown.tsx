import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Customer } from '../types';

interface CustomerDropdownProps {
  customers: Customer[];
  isOpen: boolean;
  searchTerm: string;
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerDropdown = ({ 
  customers, 
  isOpen, 
  searchTerm, 
  onCustomerSelect 
}: CustomerDropdownProps) => {
  if (!isOpen) return null;

  if (customers.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
        {customers.slice(0, 10).map(customer => (
          <div
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
            className="p-3 hover:bg-muted cursor-pointer border-b border-border/50 last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{customer.name}</p>
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {customer.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (searchTerm) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground text-sm z-50">
        No customers found matching "{searchTerm}"
      </div>
    );
  }

  return null;
};
