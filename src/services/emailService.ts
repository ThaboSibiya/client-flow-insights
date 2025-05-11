
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SendEmailParams {
  to: string;
  subject: string;
  message: string;
  senderName: string;
}

export const sendEmail = async ({ to, subject, message, senderName }: SendEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, message, senderName }
    });

    if (error) throw error;
    
    toast({
      title: "Email Sent",
      description: "Your email has been sent successfully.",
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    toast({
      title: "Email Failed",
      description: error.message || "Failed to send email. Please try again.",
      variant: "destructive",
    });
    
    return { success: false, error };
  }
};
