
import { supabase } from '@/integrations/supabase/client';

export interface EmailThread {
  id: string;
  thread_id: string;
  subject: string;
  participants: string[];
  last_message_at: string;
  message_count: number;
  unread_count: number;
  labels: string[];
  provider_id: string;
}

export interface Email {
  id: string;
  thread_id: string;
  provider_message_id: string;
  provider_id: string;
  subject: string;
  from_email: string;
  from_name?: string;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  reply_to?: string;
  body_text?: string;
  body_html?: string;
  is_read: boolean;
  is_sent: boolean;
  is_draft: boolean;
  importance: string;
  labels: string[];
  message_date: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  attachment_id?: string;
  file_path?: string;
  is_downloaded: boolean;
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!this.instance) {
      this.instance = new EmailService();
    }
    return this.instance;
  }

  async getEmailThreads(limit = 50, offset = 0): Promise<EmailThread[]> {
    const { data, error } = await supabase
      .from('email_threads')
      .select('*')
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch email threads: ${error.message}`);
    }

    return data || [];
  }

  async getEmailsByThread(threadId: string): Promise<Email[]> {
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select(`
        *,
        email_attachments (*)
      `)
      .eq('thread_id', threadId)
      .order('message_date', { ascending: true });

    if (emailsError) {
      throw new Error(`Failed to fetch emails: ${emailsError.message}`);
    }

    return emails?.map(email => ({
      ...email,
      attachments: email.email_attachments || []
    })) || [];
  }

  async markEmailAsRead(emailId: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ is_read: true })
      .eq('id', emailId);

    if (error) {
      throw new Error(`Failed to mark email as read: ${error.message}`);
    }
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark thread as read: ${error.message}`);
    }
  }

  async sendEmail(emailData: {
    to_emails: string[];
    cc_emails?: string[];
    bcc_emails?: string[];
    subject: string;
    body_html?: string;
    body_text?: string;
    thread_id?: string;
    reply_to?: string;
  }): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async syncEmails(providerId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('sync-emails', {
        body: { providerId }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Failed to sync emails:', error);
      throw error;
    }
  }

  async getSyncStatus(providerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('email_sync_status')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }

    return data;
  }

  async searchEmails(query: string, limit = 20): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select(`
        *,
        email_attachments (*)
      `)
      .or(`subject.ilike.%${query}%,body_text.ilike.%${query}%,from_email.ilike.%${query}%`)
      .order('message_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search emails: ${error.message}`);
    }

    return data?.map(email => ({
      ...email,
      attachments: email.email_attachments || []
    })) || [];
  }
}

export const emailService = EmailService.getInstance();
