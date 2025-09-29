
import { supabase } from '@/integrations/supabase/client';
import { EmailConfiguration, ParsedEmail, EmailProvider } from '@/types/email-integration';

export class EmailIntegrationService {
  private static instance: EmailIntegrationService;
  
  static getInstance(): EmailIntegrationService {
    if (!this.instance) {
      this.instance = new EmailIntegrationService();
    }
    return this.instance;
  }

  async getEmailProviders(): Promise<EmailProvider[]> {
    return [
      {
        id: 'google-gmail',
        name: 'Gmail (Google Workspace)',
        type: 'google',
        icon: '📧',
        requiresOAuth: true
      },
      {
        id: 'microsoft-outlook',
        name: 'Outlook (Microsoft 365)',
        type: 'microsoft',
        icon: '📨',
        requiresOAuth: true
      },
      {
        id: 'exchange-server',
        name: 'Exchange Server',
        type: 'exchange',
        icon: '🏢',
        requiresOAuth: false
      },
      {
        id: 'imap-generic',
        name: 'IMAP (Generic Email Provider)',
        type: 'imap',
        icon: '✉️',
        requiresOAuth: false
      }
    ];
  }

  async saveEmailConfiguration(config: EmailConfiguration): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('email_integrations')
      .upsert({
        id: config.id,
        provider_id: config.providerId,
        is_enabled: config.isEnabled,
        settings: config.settings,
        user_id: user.user?.id,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to save email configuration: ${error.message}`);
    }

    // Initialize sync status for this provider
    await this.initializeSyncStatus(config.providerId);
  }

  async initializeSyncStatus(providerId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('email_sync_status')
      .upsert({
        provider_id: providerId,
        user_id: user.user?.id,
        sync_status: 'idle',
        total_emails_synced: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider_id' });

    if (error) {
      console.error('Failed to initialize sync status:', error);
    }
  }

  async getEmailConfigurations(): Promise<EmailConfiguration[]> {
    const { data, error } = await supabase
      .from('email_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch email configurations: ${error.message}`);
    }

    return data?.map(row => ({
      id: row.id,
      providerId: row.provider_id,
      isEnabled: row.is_enabled,
      settings: row.settings as EmailConfiguration['settings']
    })) || [];
  }

  async initiateOAuthFlow(providerId: string): Promise<string> {
    try {
      console.log('Initiating OAuth flow for:', providerId);
      
      // For demo purposes, provide user-friendly error messages
      if (providerId === 'google-gmail') {
        throw new Error('Google OAuth configuration is not yet set up. Please contact your administrator to configure Google OAuth credentials.');
      } else if (providerId === 'microsoft-outlook') {
        throw new Error('Microsoft OAuth configuration is not yet set up. Please contact your administrator to configure Microsoft OAuth credentials.');
      }
      
      const { data, error } = await supabase.functions.invoke('email-oauth-init', {
        body: { providerId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.authUrl;
    } catch (error: any) {
      console.error('OAuth flow error:', error);
      throw new Error(error.message || `Failed to initiate OAuth: ${error}`);
    }
  }

  async testEmailConnection(config: EmailConfiguration): Promise<boolean> {
    try {
      console.log('Testing email connection for:', config.providerId);
      
      // For OAuth providers, check if they're configured
      if (config.providerId === 'google-gmail' || config.providerId === 'microsoft-outlook') {
        throw new Error('OAuth providers require configuration. Please complete the OAuth setup first.');
      }
      
      // For IMAP providers, validate basic settings
      if (config.providerId === 'imap-generic' || config.providerId === 'exchange-server') {
        const { serverHost, username, password } = config.settings;
        if (!serverHost || !username || !password) {
          throw new Error('Please fill in all required connection fields (server, username, password).');
        }
        // For demo purposes, return true if basic validation passes
        return true;
      }

      const { data, error } = await supabase.functions.invoke('test-email-connection', {
        body: { config }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.success;
    } catch (error: any) {
      console.error('Email connection test failed:', error);
      throw new Error(error.message || 'Connection test failed');
    }
  }

  async syncEmails(configId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('sync-emails', {
        body: { configId }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to sync emails: ${error}`);
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

  async parseEmailToTicket(email: ParsedEmail, config: EmailConfiguration): Promise<any> {
    const ticketData = {
      subject: config.settings.emailToTicketMapping.subjectToTitle ? email.subject : 'Email Inquiry',
      description: config.settings.emailToTicketMapping.bodyToDescription ? email.body : '',
      priority: config.settings.defaultTicketPriority,
      customer_email: email.from.email,
      customer_name: email.from.name || email.from.email,
      email_thread_id: email.threadId,
      original_email_id: email.id
    };

    // Create or find customer
    if (config.settings.emailToTicketMapping.senderToCustomer) {
      await this.createOrUpdateCustomer(email.from);
    }

    return ticketData;
  }

  private async createOrUpdateCustomer(sender: { email: string; name?: string }) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', sender.email)
      .single();

    if (!existingCustomer) {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('customers')
        .insert({
          name: sender.name || sender.email,
          email: sender.email,
          status: 'new',
          user_id: user.user?.id
        });

      if (error) {
        console.error('Failed to create customer from email:', error);
      }
    }
  }

  // Store synced email in database
  async storeEmail(emailData: {
    provider_message_id: string;
    provider_id: string;
    thread_id: string;
    subject: string;
    from_email: string;
    from_name?: string;
    to_emails: string[];
    cc_emails?: string[];
    bcc_emails?: string[];
    reply_to?: string;
    body_text?: string;
    body_html?: string;
    is_read: boolean;
    is_sent: boolean;
    message_date: string;
    labels?: string[];
    attachments?: any[];
  }): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    // First, ensure thread exists
    const { data: thread, error: threadError } = await supabase
      .from('email_threads')
      .select('id')
      .eq('thread_id', emailData.thread_id)
      .eq('provider_id', emailData.provider_id)
      .single();

    let threadId = thread?.id;

    if (!thread) {
      // Create new thread
      const { data: newThread, error: createThreadError } = await supabase
        .from('email_threads')
        .insert({
          user_id: user.user?.id,
          thread_id: emailData.thread_id,
          subject: emailData.subject,
          participants: [emailData.from_email, ...emailData.to_emails],
          last_message_at: emailData.message_date,
          provider_id: emailData.provider_id,
          labels: emailData.labels || []
        })
        .select('id')
        .single();

      if (createThreadError) {
        throw new Error(`Failed to create thread: ${createThreadError.message}`);
      }
      
      threadId = newThread?.id;
    }

    // Store email
    const { error: emailError } = await supabase
      .from('emails')
      .insert({
        user_id: user.user?.id,
        thread_id: threadId,
        provider_message_id: emailData.provider_message_id,
        provider_id: emailData.provider_id,
        subject: emailData.subject,
        from_email: emailData.from_email,
        from_name: emailData.from_name,
        to_emails: emailData.to_emails,
        cc_emails: emailData.cc_emails || [],
        bcc_emails: emailData.bcc_emails || [],
        reply_to: emailData.reply_to,
        body_text: emailData.body_text,
        body_html: emailData.body_html,
        is_read: emailData.is_read,
        is_sent: emailData.is_sent,
        message_date: emailData.message_date,
        labels: emailData.labels || []
      });

    if (emailError) {
      throw new Error(`Failed to store email: ${emailError.message}`);
    }

    // Store attachments if any
    if (emailData.attachments && emailData.attachments.length > 0) {
      const emailId = await this.getEmailIdByProviderMessageId(emailData.provider_message_id);
      await this.storeAttachments(emailId, emailData.attachments);
    }
  }

  private async getEmailIdByProviderMessageId(providerMessageId: string): Promise<string> {
    const { data, error } = await supabase
      .from('emails')
      .select('id')
      .eq('provider_message_id', providerMessageId)
      .single();

    if (error) {
      throw new Error(`Failed to get email ID: ${error.message}`);
    }

    return data.id;
  }

  private async storeAttachments(emailId: string, attachments: any[]): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    const attachmentData = attachments.map(attachment => ({
      email_id: emailId,
      user_id: user.user?.id,
      filename: attachment.filename,
      content_type: attachment.contentType,
      size_bytes: attachment.size,
      attachment_id: attachment.id,
      is_downloaded: false
    }));

    const { error } = await supabase
      .from('email_attachments')
      .insert(attachmentData);

    if (error) {
      throw new Error(`Failed to store attachments: ${error.message}`);
    }
  }
}

export const emailIntegrationService = EmailIntegrationService.getInstance();
