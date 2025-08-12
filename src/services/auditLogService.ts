
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

export interface LoginHistoryEntry {
  id: string;
  login_timestamp: string;
  ip_address: string;
  user_agent: string;
  employees?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface FileAccessHistoryEntry {
  id: string;
  accessed_at: string;
  action: string;
  file_path: string;
  employees?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Get login history with proper types
export const getLoginHistory = async (): Promise<LoginHistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select(`
        id,
        created_at,
        ip_address,
        user_agent,
        employees:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_type', 'user_login')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      login_timestamp: item.created_at,
      ip_address: item.ip_address || '',
      user_agent: item.user_agent || '',
      employees: item.employees
    }));
  } catch (error) {
    console.error('Failed to fetch login history:', error);
    return [];
  }
};

// Get file access history with proper types
export const getFileAccessHistory = async (): Promise<FileAccessHistoryEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select(`
        id,
        created_at,
        metadata,
        employees:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_type', 'data_access')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      accessed_at: item.created_at,
      action: item.metadata?.action || 'access',
      file_path: item.metadata?.file_path || 'Unknown',
      employees: item.employees
    }));
  } catch (error) {
    console.error('Failed to fetch file access history:', error);
    return [];
  }
};

// Log file access for audit purposes
export const logFileAccess = async (userId: string, filePath: string, action: string) => {
  try {
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: 'data_access',
        resource_type: 'file',
        metadata: {
          file_path: filePath,
          action,
          timestamp: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error('Failed to log file access:', error);
  }
};

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
