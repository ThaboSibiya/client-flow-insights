import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, X } from "lucide-react";
import { Customer } from '../types';

interface SelectedCustomerCardProps {
  customer: Customer;
  onClear: () => void;
}

export const SelectedCustomerCard = ({ customer, onClear }: SelectedCustomerCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {customer.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </span>
          )}
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
            {customer.status}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
