
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface TicketNotification {
  ticketId: string;
  customerEmail: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  type: 'comment_added' | 'status_changed' | 'ticket_created';
  details: {
    comment?: string;
    isInternal?: boolean;
    oldStatus?: string;
    newStatus?: string;
    userName?: string;
  };
}

/**
 * Send email notification for ticket updates
 */
export const sendTicketNotification = async (notification: TicketNotification) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: notification.customerEmail,
        subject: getEmailSubject(notification),
        message: getEmailBody(notification),
        senderName: 'Support Team',
      },
    });

    if (error) {
      console.error('Error sending notification:', error);
      return false;
    }

    console.log('Notification sent successfully:', data);
    return true;
  } catch (error: any) {
    console.error('Error in sendTicketNotification:', error);
    return false;
  }
};

const getEmailSubject = (notification: TicketNotification): string => {
  switch (notification.type) {
    case 'comment_added':
      return `New comment on ticket ${notification.ticketNumber}`;
    case 'status_changed':
      return `Ticket ${notification.ticketNumber} status updated`;
    case 'ticket_created':
      return `New ticket created: ${notification.ticketNumber}`;
    default:
      return `Update on ticket ${notification.ticketNumber}`;
  }
};

const getEmailBody = (notification: TicketNotification): string => {
  const baseMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${notification.customerName},</h2>
      <p>There has been an update on your ticket:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Ticket:</strong> ${notification.ticketNumber}<br>
        <strong>Subject:</strong> ${notification.subject}
      </div>
  `;

  let specificMessage = '';
  
  switch (notification.type) {
    case 'comment_added':
      if (!notification.details.isInternal) {
        specificMessage = `
          <p><strong>New comment added by ${notification.details.userName}:</strong></p>
          <div style="background-color: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
            ${notification.details.comment}
          </div>
        `;
      }
      break;
    case 'status_changed':
      specificMessage = `
        <p>Your ticket status has been updated:</p>
        <p><strong>Previous status:</strong> ${notification.details.oldStatus}</p>
        <p><strong>New status:</strong> ${notification.details.newStatus}</p>
      `;
      break;
    case 'ticket_created':
      specificMessage = `
        <p>Your support ticket has been created and we'll get back to you soon.</p>
      `;
      break;
  }

  // Only send email for non-internal comments
  if (notification.type === 'comment_added' && notification.details.isInternal) {
    return '';
  }

  return baseMessage + specificMessage + `
      <p>You can view your ticket and add additional information by logging into your account.</p>
      <p>Thank you for contacting our support team.</p>
    </div>
  `;
};
