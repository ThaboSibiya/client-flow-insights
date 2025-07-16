
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { Customer } from '@/types/customer';

interface TicketIndicatorButtonProps {
    customer: Customer;
    onManageTickets: (customer: Customer) => void;
}

const TicketIndicatorButton = ({ customer, onManageTickets }: TicketIndicatorButtonProps) => {
    if (!customer.ticketCount || customer.ticketCount <= 0) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTickets(customer)}
            className="h-8 w-8 p-0 relative"
            title={`${customer.ticketCount} ticket(s)`}
        >
            <FileText className="h-4 w-4" />
            <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
                {customer.ticketCount}
            </Badge>
        </Button>
    );
};

export default TicketIndicatorButton;
