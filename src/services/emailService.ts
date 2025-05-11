
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SendEmailParams {
  to: string;
  subject: string;
  message: string;
  senderName: string;
  templateId?: string;
  attachments?: File[];
  customerId?: string;
}

export const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Our Service',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome!</h2>
      <p>Dear {{customerName}},</p>
      <p>Welcome to our services. We're excited to work with you and help you achieve your goals.</p>
      <p>Please don't hesitate to reach out if you have any questions.</p>
      <p>Best regards,<br/>{{senderName}}</p>
    </div>`
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    subject: 'Following Up on Our Recent Discussion',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Follow-up</h2>
      <p>Dear {{customerName}},</p>
      <p>I'm following up on our recent conversation. I wanted to check if you have any questions or if there's anything else I can help you with.</p>
      <p>Looking forward to hearing from you.</p>
      <p>Best regards,<br/>{{senderName}}</p>
    </div>`
  },
  {
    id: 'appointment',
    name: 'Appointment Confirmation',
    subject: 'Your Upcoming Appointment',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Confirmation</h2>
      <p>Dear {{customerName}},</p>
      <p>This email confirms your upcoming appointment. Please let me know if you need to reschedule or have any questions.</p>
      <p>Best regards,<br/>{{senderName}}</p>
    </div>`
  }
];

export const sendEmail = async ({ to, subject, message, senderName, templateId, attachments = [], customerId }: SendEmailParams) => {
  try {
    let emailContent = message;
    let emailSubject = subject;
    
    // Process template if provided
    if (templateId) {
      const template = emailTemplates.find(t => t.id === templateId);
      if (template) {
        emailContent = template.content
          .replace(/{{customerName}}/g, to.split('@')[0])
          .replace(/{{senderName}}/g, senderName);
        emailSubject = template.subject;
      }
    }
    
    // Upload attachments if any
    const attachmentPaths: string[] = [];
    if (attachments && attachments.length > 0 && customerId) {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          for (const file of attachments) {
            const filePath = `${userId}/${customerId}/emails/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('customer-docs')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;
            if (uploadData) attachmentPaths.push(filePath);
          }
        }
      } catch (error: any) {
        console.error("Error uploading attachments:", error);
        toast({
          title: "Warning",
          description: "Attachments couldn't be uploaded, but email will still be sent.",
          variant: "destructive",
        });
      }
    }

    // Send email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { 
        to, 
        subject: emailSubject, 
        message: emailContent, 
        senderName,
        attachmentPaths
      }
    });

    if (error) throw error;
    
    // Save email history if customerId provided
    if (customerId) {
      // Use raw SQL insert since the table might not be in the type system yet
      const { error: historyError } = await supabase.rpc(
        'insert_email_history', 
        {
          p_customer_id: customerId,
          p_sender: senderName,
          p_subject: emailSubject,
          p_message: emailContent,
          p_attachments: attachmentPaths.length > 0 ? attachmentPaths : null,
          p_status: 'sent'
        }
      );
        
      if (historyError) {
        console.error("Error logging email history:", historyError);
        // Don't fail the whole operation for history logging failure
        toast({
          title: "Email Sent",
          description: "Email sent successfully but history logging failed.",
        });
      }
    }
    
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

export const getEmailHistory = async (customerId: string) => {
  try {
    // Use the RPC function to get email history
    const { data, error } = await supabase
      .rpc('get_email_history', { customer_id_param: customerId });
      
    if (error) {
      console.error("RPC function error:", error);
      
      // Fall back to a raw query
      const { data: rawData, error: rawError } = await supabase
        .from('email_history')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (rawError) {
        console.error("Raw query error:", rawError);
        throw rawError;
      }
      
      return { success: true, data: rawData };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching email history:", error);
    return { success: false, error };
  }
};
