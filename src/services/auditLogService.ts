
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const auditLogService = {
  // Log user login for security monitoring
  logLoginHistory: async (userId: string) => {
    try {
      // Get user's IP (simplified - in production use a proper service)
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      // Log to security events table
      await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: 'user_login',
          resource_type: 'auth',
          metadata: {
            login_time: new Date().toISOString(),
            ip_address: ip,
            user_agent: navigator.userAgent
          },
          ip_address: ip,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Failed to log login history:', error);
    }
  },

  // Log data access for compliance
  logDataAccess: async (userId: string, resourceType: string, resourceId: string, action: string) => {
    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: 'data_access',
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: {
            action,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
  },

  // Log privilege changes
  logPrivilegeChange: async (
    targetUserId: string,
    changedBy: string,
    privilege: string,
    oldValue: boolean,
    newValue: boolean
  ) => {
    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: changedBy,
          event_type: 'privilege_change',
          resource_type: 'employee_privilege',
          resource_id: targetUserId,
          metadata: {
            privilege,
            old_value: oldValue,
            new_value: newValue,
            changed_at: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Failed to log privilege change:', error);
    }
  }
};

// Export convenience function for login logging
export const logLoginHistory = auditLogService.logLoginHistory;
