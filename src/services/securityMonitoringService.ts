
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: string;
  user_id: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  user_agent?: string;
}

export const securityMonitoringService = {
  // Log template access patterns for monitoring — server-side only
  async logTemplateAccess(templateId: string, userId: string, actionType: 'view' | 'create' | 'update' | 'delete') {
    try {
      const event: SecurityEvent = {
        event_type: 'template_access',
        user_id: userId,
        resource_type: 'industry_template',
        resource_id: templateId,
        metadata: {
          action: actionType,
          timestamp: new Date().toISOString(),
        },
        user_agent: navigator.userAgent,
      };

      await this.storeSecurityEventServerSide(event);
    } catch (error) {
      console.error('Failed to log template access:', error);
    }
  },

  // Log email history operations for audit — server-side only
  async logEmailHistoryOperation(customerId: string, userId: string, actionType: 'create' | 'view' | 'update' | 'delete') {
    try {
      const event: SecurityEvent = {
        event_type: 'email_history_operation',
        user_id: userId,
        resource_type: 'email_history',
        resource_id: customerId,
        metadata: {
          action: actionType,
          timestamp: new Date().toISOString(),
        },
        user_agent: navigator.userAgent,
      };

      await this.storeSecurityEventServerSide(event);
    } catch (error) {
      console.error('Failed to log email history operation:', error);
    }
  },

  // Server-side security event storage via security_events table
  async storeSecurityEventServerSide(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase.from('security_events').insert({
        user_id: event.user_id,
        event_type: event.event_type,
        resource_type: event.resource_type,
        resource_id: event.resource_id,
        metadata: event.metadata,
        user_agent: event.user_agent,
      });

      if (error) {
        console.error('Failed to store security event:', error);
      }
    } catch (error) {
      console.error('Security event storage error:', error);
    }
  },
};
