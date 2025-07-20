
import React from 'react';
import { Customer } from '@/types/customer';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Trash2, Ticket, FileText } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';

interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string, checked: boolean) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onStatusChange: (customerId: string, newStatus: any) => void;
  onManageTickets: (customer: Customer) => void;
  rowIndex: number;
}

const CustomerTableRow = ({ 
  customer, 
  isSelected,
  onSelect,
  onEdit,
  onDelete, 
  onStatusChange,
  onManageTickets,
  rowIndex
}: CustomerTableRowProps) => {
  const { appliedTemplates, loading } = useCustomerCustomData(customer.id);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <TableRow className={`hover:bg-quikle-crystal/30 transition-colors ${isSelected ? 'bg-quikle-primary/10' : ''}`}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
        />
      </TableCell>
      <TableCell className="font-medium text-quikle-charcoal">
        <div className="flex items-center gap-2">
          <span>{customer.name}</span>
          {!loading && appliedTemplates.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary text-xs px-1.5 py-0.5">
                    <FileText className="h-3 w-3 mr-1" />
                    {appliedTemplates.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium mb-1">Applied Templates:</p>
                    {appliedTemplates.map(template => (
                      <p key={template.id}>{template.name} ({template.industry})</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="text-quikle-slate">{customer.email}</TableCell>
      <TableCell className="text-quikle-slate">{customer.phone}</TableCell>
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
      <TableCell className="text-quikle-slate">{formatDate(customer.createdAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onEdit(customer)} className="hover:scale-110 transition-transform">
                  <Eye className="h-4 w-4 text-quikle-primary" />
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
                  <Ticket className="h-4 w-4 text-quikle-secondary" />
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
