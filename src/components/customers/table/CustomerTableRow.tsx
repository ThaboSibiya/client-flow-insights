
import React from 'react';
import { Customer } from '@/types/customer';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Trash2, Ticket, FileText, Phone, Mail, MoreHorizontal, Edit } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { cn } from '@/lib/utils';

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
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Use pre-loaded data to avoid N+1 queries
  const customData = customer._customData || [];
  const appliedTemplates = customer._appliedTemplates || [];
  const loading = false;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (customer.phone) {
      window.open(`tel:${customer.phone}`, '_self');
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (customer.email) {
      window.open(`mailto:${customer.email}`, '_self');
    }
  };

  const handleRowClick = () => {
    onEdit(customer);
  };

  // Get key template data for inline display
  const getKeyTemplateData = () => {
    if (loading || !customData.length) return [];
    
    const availableFields = customData
      .filter((cd: any) => cd.template_fields && cd.field_value && cd.field_value.trim())
      .map((cd: any) => ({
        ...cd.template_fields,
        field_value: cd.field_value
      }))
      .sort((a: any, b: any) => {
        if (a.is_required && !b.is_required) return -1;
        if (!a.is_required && b.is_required) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      })
      .slice(0, 2)
      .map((field: any) => ({
        label: field.field_label,
        value: field.field_value,
        isRequired: field.is_required
      }));
    
    return availableFields;
  };

  const keyTemplateData = getKeyTemplateData();

  return (
    <TableRow 
      className={cn(
        "transition-all duration-150 cursor-pointer group border-b border-quikle-silver/10",
        isSelected 
          ? "bg-quikle-primary/5 hover:bg-quikle-primary/8" 
          : "hover:bg-quikle-crystal/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
    >
      {/* Checkbox */}
      <TableCell className="w-10 px-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
          className="border-quikle-silver data-[state=checked]:bg-quikle-primary"
        />
      </TableCell>

      {/* Name - Primary visual anchor */}
      <TableCell className="py-3 min-w-[180px]">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-quikle-charcoal truncate">{customer.name}</span>
              {!loading && appliedTemplates.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                      <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                        <FileText className="h-2.5 w-2.5 mr-0.5" />
                        {appliedTemplates.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="text-xs">
                        <p className="font-medium mb-1">Applied Templates:</p>
                        {appliedTemplates.map((template, index) => (
                          <p key={index} className="text-quikle-slate">
                            {template.industry_templates?.name || template.template_id} 
                            {template.industry_templates?.industry && ` (${template.industry_templates.industry})`}
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {/* Template data preview */}
            {keyTemplateData.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {keyTemplateData.map((data, index) => (
                  <span key={index} className="text-[11px] text-quikle-slate">
                    <span className="text-quikle-slate/60">{data.label}:</span> {data.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Contact Info - Compact */}
      <TableCell className="py-3 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-0.5">
          <a 
            href={`mailto:${customer.email}`}
            className="block text-quikle-slate hover:text-quikle-primary transition-colors truncate text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {customer.email}
          </a>
          {customer.phone && (
            <a 
              href={`tel:${customer.phone}`}
              className="block text-quikle-slate/70 hover:text-quikle-primary transition-colors text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.phone}
            </a>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
        <StatusSelector 
          status={customer.status} 
          onChange={(newStatus) => onStatusChange(customer.id, newStatus)} 
        />
      </TableCell>

      {/* Tickets */}
      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
        <TicketIndicator 
          tickets={customer.activeTickets || []}
          ticketCount={customer.ticketCount || 0}
          lastTicketDate={customer.lastTicketDate}
        />
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 text-quikle-slate/70 text-sm hidden lg:table-cell">
        {formatDate(customer.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 w-32" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-0.5">
          {/* Inline hover actions */}
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity duration-100",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 hover:bg-quikle-primary/10 hover:text-quikle-primary"
                    onClick={() => onEdit(customer)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">View</TooltipContent>
              </Tooltip>

              {customer.phone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={handleCall}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Call</TooltipContent>
                </Tooltip>
              )}

              {customer.email && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={handleEmail}
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Email</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 hover:bg-quikle-crystal"
              >
                <MoreHorizontal className="h-4 w-4 text-quikle-slate" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border-quikle-silver/30 shadow-lg">
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="mr-2 h-3.5 w-3.5 text-quikle-primary" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onManageTickets(customer)}>
                <Ticket className="mr-2 h-3.5 w-3.5 text-quikle-accent" />
                Tickets
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-quikle-silver/20" />

              <DropdownMenuItem 
                onClick={() => onDelete(customer.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerTableRow;
