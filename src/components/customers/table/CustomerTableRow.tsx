
import React from 'react';
import { Customer } from '@/types/customer';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Ticket, Phone, Mail, MoreHorizontal, Edit, FileText, MessageSquareText, Mic, Globe, Users, Webhook } from 'lucide-react';
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

const SOURCE_ICON: Record<string, React.ReactNode> = {
  'Voice AI Agent': <Mic className="h-3 w-3" />,
  'Website': <Globe className="h-3 w-3" />,
  'Referral': <Users className="h-3 w-3" />,
  'webhook': <Webhook className="h-3 w-3" />,
};

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
  const customData = customer._customData || [];
  const appliedTemplates = customer._appliedTemplates || [];
  
  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '—';
    }
  };

  const ticketCount = customer.ticketCount || 0;
  const openTickets = (customer.activeTickets || []).filter(
    (t: any) => t.status === 'open' || t.status === 'in-progress' || t.status === 'in_progress'
  ).length;

  const getKeyTemplateData = () => {
    if (!customData.length) return [];
    return customData
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
      }));
  };

  const keyTemplateData = getKeyTemplateData();

  return (
    <TableRow 
      className={cn(
        "transition-colors border-b border-border group",
        isSelected 
          ? "bg-primary/5" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Checkbox */}
      <TableCell className="w-10 px-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </TableCell>

      {/* Name — clickable to open details */}
      <TableCell className="py-3 min-w-[180px]">
        <div className="min-w-0">
          <button
            onClick={() => onEdit(customer)}
            className="text-left group/name"
          >
            <span className="font-semibold text-foreground group-hover/name:text-primary transition-colors truncate block">
              {customer.name}
            </span>
          </button>
          {appliedTemplates.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                <FileText className="h-2.5 w-2.5" />
                {appliedTemplates.length}
              </Badge>
            </div>
          )}
          {keyTemplateData.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              {keyTemplateData.map((data, index) => (
                <span key={index} className="text-[11px] text-muted-foreground">
                  <span className="opacity-60">{data.label}:</span> {data.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell className="py-3 text-sm">
        <div className="space-y-0.5">
          <a 
            href={`mailto:${customer.email}`}
            className="block text-muted-foreground hover:text-primary transition-colors truncate text-sm"
          >
            {customer.email}
          </a>
          {customer.phone && (
            <a 
              href={`tel:${customer.phone}`}
              className="block text-muted-foreground/70 hover:text-primary transition-colors text-xs"
            >
              {customer.phone}
            </a>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <StatusSelector 
          status={customer.status} 
          onChange={(newStatus) => onStatusChange(customer.id, newStatus)} 
        />
      </TableCell>

      {/* Source */}
      <TableCell className="py-3 hidden md:table-cell">
        {customer.source ? (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs font-normal gap-1 cursor-default">
                  {SOURCE_ICON[customer.source]}
                  {customer.source}
                </Badge>
              </TooltipTrigger>
              {customer.reason && (
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  <div className="flex items-start gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{customer.reason}</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      {/* Tickets — compact badge */}
      <TableCell className="py-3">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onManageTickets(customer)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                  ticketCount === 0
                    ? "text-muted-foreground"
                    : openTickets > 0
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {openTickets > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                {ticketCount > 0 ? `${ticketCount} ticket${ticketCount !== 1 ? 's' : ''}` : '—'}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {ticketCount === 0 ? 'No tickets' : `${openTickets} open · ${ticketCount} total`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 text-muted-foreground text-sm hidden lg:table-cell">
        {formatDate(customer.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 w-12">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="mr-2 h-3.5 w-3.5" />
                View / Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageTickets(customer)}>
                <Ticket className="mr-2 h-3.5 w-3.5" />
                Tickets
              </DropdownMenuItem>
              {customer.phone && (
                <DropdownMenuItem onClick={() => window.open(`tel:${customer.phone}`, '_self')}>
                  <Phone className="mr-2 h-3.5 w-3.5" />
                  Call
                </DropdownMenuItem>
              )}
              {customer.email && (
                <DropdownMenuItem onClick={() => window.open(`mailto:${customer.email}`, '_self')}>
                  <Mail className="mr-2 h-3.5 w-3.5" />
                  Email
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(customer.id)}
                className="text-destructive focus:text-destructive"
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
