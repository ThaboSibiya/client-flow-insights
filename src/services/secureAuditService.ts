
import { supabase } from '@/integrations/supabase/client';
import { logSecureSecurityEvent } from './secureSecurityService';

export interface SecureAuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

// Write to secure audit logs table
export const writeSecureAuditLog = async (entry: Omit<SecureAuditLogEntry, 'id' | 'timestamp'>) => {
  try {
    const { error } = await supabase
      .from('security_audit_logs')
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        success: entry.success,
        error_message: entry.error_message,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent || navigator.userAgent,
        metadata: entry.metadata || {}
      });

    if (error) {
      console.error('Failed to write secure audit log:', error);
      // Don't throw - audit logging should not break application flow
    }
  } catch (error) {
    console.error('Error writing secure audit log:', error);
    // Don't throw - audit logging should not break application flow
  }
};

// Read secure audit logs (only for authorized users)
export const readSecureAuditLogs = async (limit: number = 100): Promise<SecureAuditLogEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('id, user_id, action, resource_type, resource_id, success, error_message, ip_address, user_agent, metadata, timestamp')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      await logSecureSecurityEvent({
        action: 'audit_log_read_failed',
        resource_type: 'security_audit_logs',
        success: false,
        error_message: error.message
      });
      return [];
    }

    await logSecureSecurityEvent({
      action: 'audit_log_read_success',
      resource_type: 'security_audit_logs',
      success: true,
      metadata: { records_read: data?.length || 0 }
    });

    // Transform the data to match our interface, handling the Json type properly
    const transformedData: SecureAuditLogEntry[] = (data || []).map(record => ({
      id: record.id,
      user_id: record.user_id,
      action: record.action,
      resource_type: record.resource_type,
      resource_id: record.resource_id,
      success: record.success,
      error_message: record.error_message,
      ip_address: record.ip_address,
      user_agent: record.user_agent,
      metadata: typeof record.metadata === 'object' && record.metadata !== null 
        ? record.metadata as Record<string, any> 
        : {},
      timestamp: record.timestamp
    }));

    return transformedData;
  } catch (error) {
    console.error('Error reading secure audit logs:', error);
    await logSecureSecurityEvent({
      action: 'audit_log_read_error',
      resource_type: 'security_audit_logs',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
};

// Enhanced privilege change logging
export const logSecurePrivilegeChange = async (
  employeeId: string,
  privilegeName: string,
  oldValue: boolean,
  newValue: boolean,
  reason?: string
) => {
  try {
    // Use the existing RPC for privilege change audit
    await supabase.rpc('log_privilege_change', {
      p_employee_id: employeeId,
      p_privilege_name: privilegeName,
      p_old_value: oldValue,
      p_new_value: newValue,
      p_reason: reason
    });

    // Also log to secure audit logs
    await writeSecureAuditLog({
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      action: 'privilege_change_logged',
      resource_type: 'employee_privileges', 
      resource_id: employeeId,
      success: true,
      metadata: {
        privilege_name: privilegeName,
        old_value: oldValue,
        new_value: newValue,
        reason: reason || 'No reason provided'
      }
    });

  } catch (error) {
    console.error('Error logging secure privilege change:', error);
    await logSecureSecurityEvent({
      action: 'privilege_change_log_failed',
      resource_type: 'employee_privileges',
      resource_id: employeeId,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
