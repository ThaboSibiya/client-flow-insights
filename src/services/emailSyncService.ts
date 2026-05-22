
import { supabase } from '@/integrations/supabase/client';
import { emailIntegrationService } from './emailIntegrationService';
import { EmailConfiguration } from '@/types/email-integration';

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  totalEmails: number;
  processedEmails: number;
  lastSyncAt: string | null;
  errorMessage?: string;
}

export class EmailSyncService {
  private static instance: EmailSyncService;
  
  static getInstance(): EmailSyncService {
    if (!this.instance) {
      this.instance = new EmailSyncService();
    }
    return this.instance;
  }

  async syncEmailsForProvider(providerId: string): Promise<void> {
    try {
      // Update sync status to syncing
      await this.updateSyncStatus(providerId, {
        status: 'syncing',
        totalEmails: 0,
        processedEmails: 0,
        lastSyncAt: null
      });

      // Get the email configuration for this provider
      const configurations = await emailIntegrationService.getEmailConfigurations();
      const config = configurations.find(c => c.providerId === providerId && c.isEnabled);
      
      if (!config) {
        throw new Error(`No enabled configuration found for provider: ${providerId}`);
      }

      // Call the sync edge function
      const { error } = await supabase.functions.invoke('sync-emails', {
        body: { 
          providerId,
          configId: config.id 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update sync status to completed
      await this.updateSyncStatus(providerId, {
        status: 'completed',
        totalEmails: 0,
        processedEmails: 0,
        lastSyncAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Email sync failed:', error);
      
      // Update sync status to error
      await this.updateSyncStatus(providerId, {
        status: 'error',
        totalEmails: 0,
        processedEmails: 0,
        lastSyncAt: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  async syncAllProviders(): Promise<void> {
    const configurations = await emailIntegrationService.getEmailConfigurations();
    const enabledProviders = configurations.filter(config => config.isEnabled);
    
    const syncPromises = enabledProviders.map(config => 
      this.syncEmailsForProvider(config.providerId)
    );
    
    await Promise.allSettled(syncPromises);
  }

  async getSyncStatus(providerId: string): Promise<SyncProgress | null> {
    const { data, error } = await supabase
      .from('email_sync_status')
      .select('sync_status, last_sync_at, error_message, total_emails_synced')
      .eq('provider_id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }

    if (!data) return null;

    return {
      status: data.sync_status as SyncProgress['status'],
      totalEmails: data.total_emails_synced || 0,
      processedEmails: data.total_emails_synced || 0,
      lastSyncAt: data.last_sync_at,
      errorMessage: data.error_message || undefined
    };
  }

  private async updateSyncStatus(providerId: string, progress: Partial<SyncProgress>): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    const updateData: any = {
      provider_id: providerId,
      user_id: user.user?.id,
      updated_at: new Date().toISOString()
    };

    if (progress.status) updateData.sync_status = progress.status;
    if (progress.lastSyncAt) updateData.last_sync_at = progress.lastSyncAt;
    if (progress.errorMessage) updateData.error_message = progress.errorMessage;
    if (progress.totalEmails !== undefined) updateData.total_emails_synced = progress.totalEmails;

    const { error } = await supabase
      .from('email_sync_status')
      .upsert(updateData, { 
        onConflict: 'user_id,provider_id' 
      });

    if (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  // Real-time sync status updates
  subscribeToSyncUpdates(providerId: string, callback: (progress: SyncProgress) => void) {
    const channel = supabase
      .channel(`sync-status-${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'email_sync_status',
          filter: `provider_id=eq.${providerId}`
        },
        (payload) => {
          const data = payload.new;
          callback({
            status: data.sync_status,
            totalEmails: data.total_emails_synced || 0,
            processedEmails: data.total_emails_synced || 0,
            lastSyncAt: data.last_sync_at,
            errorMessage: data.error_message || undefined
          });
        }
      )
      .subscribe();

    // Return a synchronous cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const emailSyncService = EmailSyncService.getInstance();
