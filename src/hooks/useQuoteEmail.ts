
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useQuoteEmail = () => {
  const [isSending, setIsSending] = useState(false);

  const sendQuoteEmail = async (quote: QuoteInvoice) => {
    if (!quote.customer_email) {
      toast({
        title: "Error",
        description: "Customer email is required to send the quote",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate email sending - replace with actual email service integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email Sent",
        description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} ${quote.number} has been sent to ${quote.customer_email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendQuoteEmail,
    isSending,
  };
};
