
import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Phone, 
  Mail, 
  MoreVertical, 
  Edit, 
  MessageSquare, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { useVoiceCall } from '@/hooks/useVoiceCall';

interface MobileCustomerQuickActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
}

const MobileCustomerQuickActions = ({
  customer,
  onEdit,
  onDelete,
  onManageTickets,
}: MobileCustomerQuickActionsProps) => {
  const { makeCall, isCalling } = useVoiceCall();

  const handleCall = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (customer.phone) {
      makeCall({ phoneNumber: customer.phone, customerId: customer.id });
    }
  };

  const handleEmail = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (customer.email) {
      window.location.href = `mailto:${customer.email}`;
    }
  };

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-quikle-silver/20">
      <div className="flex items-center gap-2">
        {customer.phone && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCall}
            disabled={isCalling}
            className="touch-target h-10 px-4 bg-white hover:bg-quikle-crystal border-quikle-silver text-quikle-primary"
            aria-label={`Call ${customer.name}`}
          >
            {isCalling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            Call
          </Button>
        )}
        
        {customer.email && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmail}
            className="touch-target h-10 px-4 bg-white hover:bg-quikle-crystal border-quikle-silver text-quikle-primary"
            aria-label={`Email ${customer.name}`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="touch-target h-10 w-10 p-0 hover:bg-quikle-crystal"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border-quikle-silver shadow-luxury">
          <DropdownMenuItem 
            onClick={() => onEdit(customer)}
            className="touch-target py-3 px-4 hover:bg-quikle-crystal cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-3" />
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onManageTickets(customer)}
            className="touch-target py-3 px-4 hover:bg-quikle-crystal cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            Manage Tickets
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(customer.id)}
            className="touch-target py-3 px-4 hover:bg-red-50 text-red-600 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileCustomerQuickActions;
