
import React from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Trash2, 
  Ticket, 
  Phone, 
  Mail, 
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  User
} from 'lucide-react';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';

interface EnhancedMobileCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (customerId: string, newStatus: any) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const EnhancedMobileCustomerCard = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onManageTickets,
  isExpanded,
  onToggleExpanded
}: EnhancedMobileCustomerCardProps) => {
  // Use pre-loaded data to avoid N+1 queries
  const appliedTemplates = (customer as any)._appliedTemplates || [];
  const customData = (customer as any)._customData || [];
  const loading = false;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const importantFields = customData
    .filter((cd: any) => cd.template_fields && cd.field_value && cd.field_value.trim())
    .map((cd: any) => ({
      ...cd.template_fields,
      field_value: cd.field_value
    }))
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .slice(0, 2);

  return (
    <Card className={`transition-all duration-200 shadow-md hover:shadow-lg ${
      isSelected ? 'ring-2 ring-quikle-primary bg-quikle-primary/5' : 'bg-gradient-to-br from-white to-quikle-crystal/30'
    }`}>
      <CardContent className="p-4">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-quikle-charcoal">{customer.name}</h3>
                {!loading && appliedTemplates.length > 0 && (
                  <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary text-xs px-1.5 py-0.5">
                    <FileText className="h-3 w-3 mr-1" />
                    {appliedTemplates.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="ml-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-quikle-slate">
            <Mail className="h-3 w-3" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-quikle-slate">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>

        {/* Status and Tickets */}
        <div className="flex items-center gap-3 mb-3">
          <StatusSelector 
            status={customer.status} 
            onChange={(newStatus) => onStatusChange(customer.id, newStatus)} 
          />
          <TicketIndicator 
            tickets={customer.activeTickets || []}
            ticketCount={customer.ticketCount || 0}
            lastTicketDate={customer.lastTicketDate}
          />
        </div>

        {/* Applied Templates Preview */}
        {!loading && appliedTemplates.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {appliedTemplates.map(template => (
                <Badge key={template.id} variant="outline" className="text-xs border-quikle-primary/30 text-quikle-primary">
                  {template.industry}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-quikle-silver/20 space-y-3">
            {/* Creation Date */}
            <div className="flex items-center gap-2 text-sm text-quikle-slate">
              <Calendar className="h-3 w-3" />
              <span>Created: {formatDate(customer.createdAt)}</span>
            </div>

            {/* Important Custom Fields */}
            {importantFields.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-quikle-charcoal">
                  <User className="h-3 w-3" />
                  <span>Custom Information</span>
                </div>
                {importantFields.map((field: any) => (
                    <div key={field.id} className="ml-5 text-xs">
                      <span className="font-medium text-quikle-slate">{field.field_label}:</span>
                      <span className="ml-1 text-quikle-charcoal">{field.field_value}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Notes if available */}
            {customer.notes && (
              <div className="text-sm">
                <span className="font-medium text-quikle-slate">Notes: </span>
                <span className="text-quikle-charcoal">{customer.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-quikle-silver/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(customer)}
            className="text-quikle-primary hover:bg-quikle-primary/10"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTickets(customer)}
            className="text-quikle-secondary hover:bg-quikle-secondary/10"
          >
            <Ticket className="h-4 w-4 mr-1" />
            Tickets
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(customer.id)}
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMobileCustomerCard;
