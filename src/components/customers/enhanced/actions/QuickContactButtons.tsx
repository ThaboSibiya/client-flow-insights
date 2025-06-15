
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { Customer } from '@/context/CRMContext';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { useToast } from '@/components/ui/use-toast';

interface QuickContactButtonsProps {
  customer: Customer;
}

const QuickContactButtons = ({ customer }: QuickContactButtonsProps) => {
    const { makeCall, isCalling } = useVoiceCall();
    const { toast } = useToast();

    const handleContact = (method: 'email' | 'phone') => {
        if (method === 'email' && customer.email) {
            window.location.href = `mailto:${customer.email}`;
        } else if (method === 'phone' && customer.phone) {
            makeCall({ phoneNumber: customer.phone, customerId: customer.id });
        } else {
            toast({
                title: "Contact information missing",
                description: `No ${method} address found for this customer`,
                variant: "destructive",
            });
        }
    };
  
    return (
        <div className="flex items-center">
            {customer.email && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleContact('email')}
                    className="h-8 w-8 p-0"
                    title={`Email ${customer.name}`}
                >
                    <Mail className="h-4 w-4" />
                </Button>
            )}

            {customer.phone && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleContact('phone')}
                    className="h-8 w-8 p-0"
                    title={`Call ${customer.name}`}
                    disabled={isCalling}
                >
                    {isCalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                </Button>
            )}
        </div>
    );
};

export default QuickContactButtons;
