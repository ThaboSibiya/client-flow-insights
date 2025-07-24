
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
    const { error } = await supabase
      .from('email_integrations')
      .upsert({
        id: config.id,
        provider_id: config.providerId,
        is_enabled: config.isEnabled,
        settings: config.settings,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to save email configuration: ${error.message}`);
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
      settings: row.settings
    })) || [];
  }

  async initiateOAuthFlow(providerId: string): Promise<string> {
    // This would typically call an edge function to handle OAuth
    const { data, error } = await supabase.functions.invoke('email-oauth-init', {
      body: { providerId }
    });

    if (error) {
      throw new Error(`Failed to initiate OAuth: ${error.message}`);
    }

    return data.authUrl;
  }

  async testEmailConnection(config: EmailConfiguration): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('test-email-connection', {
        body: { config }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.success;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  async parseEmailToTicket(email: ParsedEmail, config: EmailConfiguration): Promise<any> {
    const ticketData = {
      subject: config.settings.emailToTicketMapping.subjectToTitle ? email.subject : 'Email Inquiry',
      description: config.settings.emailToTicketMapping.bodyToDescription ? email.body : '',
      priority: config.settings.defaultTicketPriority,
      customer_email: email.from.email,
      customer_name: email.from.name || email.from.email,
      source: 'email',
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

  async syncEmails(configId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('sync-emails', {
      body: { configId }
    });

    if (error) {
      throw new Error(`Failed to sync emails: ${error.message}`);
    }
  }
}

export const emailIntegrationService = EmailIntegrationService.getInstance();
