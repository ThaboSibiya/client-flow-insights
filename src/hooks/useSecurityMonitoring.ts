
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { logSecurityEvent } from '@/utils/securityUtils';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logEvent = useCallback(async (
    eventType: string,
    resourceType?: string,
    resourceId?: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      // Log to local storage immediately
      logSecurityEvent(eventType, { resourceType, resourceId, ...metadata });

      // Attempt to log to database
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Failed to log security event to database:', error);
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  }, [user]);

  const logTemplateAccess = useCallback((templateId: string, action: string) => {
    logEvent('template_access', 'template', templateId, { action });
  }, [logEvent]);

  const logCustomerAccess = useCallback((customerId: string, action: string) => {
    logEvent('customer_access', 'customer', customerId, { action });
  }, [logEvent]);

  const logPrivilegeEscalation = useCallback((targetUserId: string, privilege: string) => {
    logEvent('privilege_escalation', 'employee', targetUserId, { privilege });
  }, [logEvent]);

  const logSuspiciousActivity = useCallback((activityType: string, details: Record<string, any>) => {
    logEvent('suspicious_activity', 'system', undefined, { activityType, ...details });
  }, [logEvent]);

  return {
    logEvent,
    logTemplateAccess,
    logCustomerAccess,
    logPrivilegeEscalation,
    logSuspiciousActivity
  };
};
