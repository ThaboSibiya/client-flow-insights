
import React from 'react';
import { Customer } from '@/types/customer';
import { Mail, Phone, Calendar } from 'lucide-react';
import TicketIndicator from '../../TicketIndicator';
import { useVoiceCall } from '@/hooks/useVoiceCall';

interface MobileCustomerDetailsProps {
  customer: Customer;
}

const MobileCustomerDetails = ({ customer }: MobileCustomerDetailsProps) => {
  const { makeCall, isCalling } = useVoiceCall();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleCall = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (customer.phone) {
      makeCall({ phoneNumber: customer.phone, customerId: customer.id });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Contact Information */}
      <div className="bg-quikle-crystal/30 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-quikle-charcoal text-sm">Contact Details</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="h-4 w-4 text-quikle-primary flex-shrink-0" />
            <a 
              href={`mailto:${customer.email}`}
              className="text-quikle-charcoal hover:text-quikle-primary transition-colors touch-target block py-1"
              aria-label={`Email ${customer.name} at ${customer.email}`}
            >
              {customer.email}
            </a>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <Phone className="h-4 w-4 text-quikle-primary flex-shrink-0" />
            {customer.phone ? (
              <button
                onClick={handleCall}
                disabled={isCalling}
                className="text-quikle-charcoal hover:text-quikle-primary transition-colors touch-target py-1 text-left"
                aria-label={`Call ${customer.name} at ${customer.phone}`}
              >
                {customer.phone}
              </button>
            ) : (
              <span className="text-quikle-slate">No phone</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="h-4 w-4 text-quikle-primary flex-shrink-0" />
            <span className="text-quikle-slate">Created {formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-white rounded-lg border border-quikle-silver/20 p-4">
        <h4 className="font-medium text-quikle-charcoal text-sm mb-3">Tickets & Activity</h4>
        <TicketIndicator
          tickets={customer.activeTickets || []}
          ticketCount={customer.ticketCount || 0}
          lastTicketDate={customer.lastTicketDate}
        />
      </div>
    </div>
  );
};

export default MobileCustomerDetails;
