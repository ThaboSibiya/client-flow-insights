
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';

interface DynamicTableCellProps {
  customer: Customer;
  columnKey: string;
  columnType: string;
  value: any;
  onStatusChange?: (customerId: string, newStatus: any) => void;
}

const DynamicTableCell = ({ 
  customer, 
  columnKey, 
  columnType, 
  value,
  onStatusChange 
}: DynamicTableCellProps) => {
  const formatValue = () => {
    if (!value && value !== 0) return '-';
    
    switch (columnType) {
      case 'date':
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(value));
      
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-quikle-primary hover:text-quikle-secondary transition-colors"
          >
            {value}
          </a>
        );
      
      case 'phone':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-quikle-primary hover:text-quikle-secondary transition-colors"
          >
            {value}
          </a>
        );
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      
      default:
        return value;
    }
  };

  // Special handling for specific columns
  if (columnKey === 'status' && onStatusChange) {
    return (
      <TableCell className="px-4 py-3">
        <StatusSelector 
          status={customer.status} 
          onChange={(newStatus) => onStatusChange(customer.id, newStatus)} 
        />
      </TableCell>
    );
  }

  if (columnKey === 'tickets') {
    return (
      <TableCell className="px-4 py-3">
        <TicketIndicator 
          tickets={customer.activeTickets || []}
          ticketCount={customer.ticketCount || 0}
          lastTicketDate={customer.lastTicketDate}
        />
      </TableCell>
    );
  }

  if (columnKey === 'name') {
    return (
      <TableCell className="px-4 py-3 font-medium text-quikle-charcoal">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{value}</div>
            {/* Show industry badges if available */}
            <div className="mt-1 flex flex-wrap gap-1">
              {/* This would show applied industry templates */}
              {/* We'll implement this when we have the template data */}
            </div>
          </div>
        </div>
      </TableCell>
    );
  }

  // Default cell rendering
  return (
    <TableCell className="px-4 py-3 text-quikle-slate">
      {formatValue()}
    </TableCell>
  );
};

export default DynamicTableCell;
