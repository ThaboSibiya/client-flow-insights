import React from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { useVoiceCall } from '@/hooks/useVoiceCall';

interface MobileCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const MobileCustomerCard = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onManageTickets,
  isExpanded,
  onToggleExpanded,
}: MobileCustomerCardProps) => {
  const { makeCall, isCalling } = useVoiceCall();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleSwipeAction = (action: 'edit' | 'delete' | 'tickets') => {
    switch (action) {
      case 'edit':
        onEdit(customer);
        break;
      case 'delete':
        onDelete(customer.id);
        break;
      case 'tickets':
        onManageTickets(customer);
        break;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handleCall = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (customer.phone) {
      makeCall({ phoneNumber: customer.phone, customerId: customer.id });
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
      role="listitem"
      aria-label={`Customer card for ${customer.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select customer ${customer.name}`}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {customer.name}
              </h3>
              <StatusSelector
                status={customer.status}
                onChange={(status) => onStatusChange(customer.id, status)}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} customer details`}
            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            onKeyDown={(e) => handleKeyDown(e, onToggleExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 animate-fade-in">
          <div className="space-y-3">
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <a 
                  href={`mailto:${customer.email}`}
                  className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={`Email ${customer.name} at ${customer.email}`}
                >
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {isCalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                {customer.phone ? (
                  <button
                    onClick={handleCall}
                    disabled={isCalling}
                    className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50"
                    aria-label={`Call ${customer.name} at ${customer.phone}`}
                  >
                    {customer.phone}
                  </button>
                ) : (
                  <span className="text-gray-500">No phone</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(customer.createdAt)}</span>
              </div>
            </div>

            {/* Tickets */}
            <div>
              <TicketIndicator
                tickets={customer.activeTickets || []}
                ticketCount={customer.ticketCount || 0}
                lastTicketDate={customer.lastTicketDate}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipeAction('edit')}
                className="hover:scale-105 transition-transform"
                aria-label={`Edit ${customer.name}`}
                onKeyDown={(e) => handleKeyDown(e, () => handleSwipeAction('edit'))}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipeAction('tickets')}
                className="hover:scale-105 transition-transform"
                aria-label={`Manage tickets for ${customer.name}`}
                onKeyDown={(e) => handleKeyDown(e, () => handleSwipeAction('tickets'))}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipeAction('delete')}
                className="hover:scale-105 transition-transform text-red-600 hover:text-red-700"
                aria-label={`Delete ${customer.name}`}
                onKeyDown={(e) => handleKeyDown(e, () => handleSwipeAction('delete'))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MobileCustomerCard;
