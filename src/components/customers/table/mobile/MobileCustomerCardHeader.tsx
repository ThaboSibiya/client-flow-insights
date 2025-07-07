
import React from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatusSelector from '../../StatusSelector';

interface MobileCustomerCardHeaderProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const MobileCustomerCardHeader = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  isExpanded,
  onToggleExpanded,
}: MobileCustomerCardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select customer ${customer.name}`}
          className="touch-target flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-quikle-charcoal truncate">
            {customer.name}
          </h3>
          <div className="mt-1">
            <StatusSelector
              status={customer.status}
              onChange={(status) => onStatusChange(customer.id, status)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} customer details`}
          className="touch-target h-10 w-10 p-0 hover:bg-quikle-crystal transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileCustomerCardHeader;
