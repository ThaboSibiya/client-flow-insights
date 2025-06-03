
import React from 'react';
import { Customer, CustomerStatus } from '@/context/CRMContext';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Ticket } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import StatusSelector from './StatusSelector';
import TicketIndicator from './TicketIndicator';

interface CustomerTableRowProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onStatusChange: (customerId: string, newStatus: CustomerStatus) => void;
  onManageTickets: (customer: Customer) => void;
}

const CustomerTableRow = ({ 
  customer, 
  onView,
  onDelete, 
  onStatusChange,
  onManageTickets 
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
      <TableCell>
        <TicketIndicator 
          tickets={customer.activeTickets || []}
          ticketCount={customer.ticketCount || 0}
          lastTicketDate={customer.lastTicketDate}
        />
      </TableCell>
      <TableCell>{formatDate(customer.createdAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onView(customer)} className="hover:scale-110 transition-transform">
                  <Eye className="h-4 w-4 text-blue-500 hover:text-broker-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Customer Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onManageTickets(customer)} className="hover:scale-110 transition-transform">
                  <Ticket className="h-4 w-4 text-purple-500 hover:text-broker-secondary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Tickets</p>
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
