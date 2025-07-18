import { useState } from 'react';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useUpdateQuoteStatus } from '@/hooks/mutations/useUpdateQuoteStatus';
import { QuoteInvoice } from '@/types/quote';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useQuoteEmail = () => {
    const { user } = useAuth();
    const { settings } = useAutomationSettings();
    const { profile } = useCompanyProfile();
    const { updateQuoteStatus } = useUpdateQuoteStatus();
    const [isSending, setIsSending] = useState(false);

    const sendQuoteEmail = async (quote: QuoteInvoice) => {
        if (!quote.customer_email) {
            toast({
                title: "Error",
                description: "Customer email is missing.",
                variant: "destructive"
            });
            return;
        }

        setIsSending(true);

        try {
            const senderName = profile?.company || 'Your Company';
            
            let emailSubject = settings?.email_subject || `Your ${quote.type} from ${senderName}`;
            let emailMessage = settings?.email_message || `Hi [Customer Name],\n\nPlease find your ${quote.type} attached.\n\nThank you!`;

            // Replace placeholders
            const yourName = ((profile as any)?.first_name && (profile as any)?.last_name) ? `${(profile as any).first_name} ${(profile as any).last_name}` : (user?.user_metadata?.full_name || senderName);

            emailSubject = emailSubject.replace(/\[Customer Name\]/g, quote.customer_name || 'Valued Customer')
                                      .replace(/\[Company Name\]/g, senderName)
                                      .replace(/\[Your Name\]/g, yourName)
                                      .replace(/\[Quote\/Invoice Number\]/g, quote.number);

            const emailMessageHtml = emailMessage.replace(/\[Customer Name\]/g, quote.customer_name || 'Valued Customer')
                                      .replace(/\[Company Name\]/g, senderName)
                                      .replace(/\[Your Name\]/g, yourName)
                                      .replace(/\[Quote\/Invoice Number\]/g, quote.number)
                                      .replace(/\n/g, '<br>');

            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: quote.customer_email,
                    subject: emailSubject,
                    message: emailMessageHtml,
                    senderName: senderName,
                }
            });

            if (error) throw error;
            
            await updateQuoteStatus({ id: quote.id, status: 'sent' });

            toast({
                title: "Email Sent",
                description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} has been sent to ${quote.customer_email}.`
            });

        } catch (error: any) {
            console.error("Failed to send email:", error);
            toast({
                title: "Failed to send email",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    return { sendQuoteEmail, isSending };
};
