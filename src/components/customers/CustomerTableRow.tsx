
import React from 'react';
import { Customer, CustomerStatus } from '@/context/CRMContext';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import StatusSelector from './StatusSelector';

interface CustomerTableRowProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onStatusChange: (customerId: string, newStatus: CustomerStatus) => void;
}

const CustomerTableRow = ({ 
  customer, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: CustomerTableRowProps) => {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <TableRow className="hover:bg-gray-50/50 transition-colors">
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>{customer.phone}</TableCell>
      <TableCell>
        <StatusSelector 
          status={customer.status} 
          onChange={(newStatus) => onStatusChange(customer.id, newStatus)} 
        />
      </TableCell>
      <TableCell>{formatDate(customer.createdAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onEdit(customer)} className="hover:scale-110 transition-transform">
                  <Edit className="h-4 w-4 text-gray-500 hover:text-broker-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onDelete(customer.id)} className="hover:scale-110 transition-transform">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Customer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
