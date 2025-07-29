
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, sanitizeInput } from '@/utils/securityUtils';
import { logSecureSecurityEvent } from './secureSecurityService';

export interface ValidatedEmailData {
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  body_html?: string;
  body_text?: string;
  thread_id?: string;
  reply_to?: string;
}

export const sendValidatedEmail = async (emailData: ValidatedEmailData): Promise<void> => {
  try {
    // Validate all email addresses
    const allEmails = [
      ...emailData.to_emails,
      ...(emailData.cc_emails || []),
      ...(emailData.bcc_emails || [])
    ];

    for (const email of allEmails) {
      if (!validateEmail(email)) {
        await logSecureSecurityEvent({
          action: 'email_validation_failed',
          resource_type: 'email',
          success: false,
          error_message: `Invalid email address: ${email}`,
          metadata: { invalid_email: email }
        });
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    // Sanitize input data
    const sanitizedData = {
      ...emailData,
      subject: sanitizeInput(emailData.subject, 200),
      body_text: emailData.body_text ? sanitizeInput(emailData.body_text, 10000) : undefined,
      body_html: emailData.body_html ? sanitizeInput(emailData.body_html, 50000) : undefined
    };

    // Send email through secure edge function
    const { error } = await supabase.functions.invoke('send-validated-email', {
      body: sanitizedData
    });

    if (error) {
      await logSecureSecurityEvent({
        action: 'email_send_failed',
        resource_type: 'email',
        success: false,
        error_message: error.message
      });
      throw error;
    }

    await logSecureSecurityEvent({
      action: 'email_sent',
      resource_type: 'email',
      success: true,
      metadata: { 
        recipient_count: emailData.to_emails.length,
        has_attachments: false
      }
    });

  } catch (error) {
    console.error('Failed to send validated email:', error);
    throw error;
  }
};
