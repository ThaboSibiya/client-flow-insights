
import { supabase } from '@/integrations/supabase/client';

export interface SecureSecurityAuditEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export const logSecureSecurityEvent = async (event: SecureSecurityAuditEvent) => {
  try {
    // Use the security_events table directly with proper RLS
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: event.action,
        event_data: {
          ...event,
          timestamp: new Date().toISOString()
        },
        ip_address: event.ip_address || await getClientIP(),
        user_agent: event.user_agent || navigator.userAgent
      });

    if (error) {
      console.error('Failed to log security event:', error);
      // Fallback to client-side logging only as last resort
      fallbackSecurityLogging(event);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
    fallbackSecurityLogging(event);
  }
};

// Helper function to get client IP (best effort)
const getClientIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
};

// Fallback client-side logging (less secure but better than nothing)
const fallbackSecurityLogging = (event: SecureSecurityAuditEvent) => {
  console.warn('Using fallback security logging - this should not happen in production');
  console.log('Security Event:', {
    ...event,
    timestamp: new Date().toISOString(),
    logged_via: 'client_fallback'
  });
};

export const hasValidPrivileges = async (requiredPrivilege: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await logSecureSecurityEvent({
        action: 'privilege_check_unauthorized',
        resource_type: 'employee_privileges',
        success: false,
        error_message: 'No authenticated user'
      });
      return false;
    }

    // Get employee record and check privilege directly from database
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!employee) {
      await logSecureSecurityEvent({
        action: 'privilege_check_failed',
        resource_type: 'employee_privileges',
        success: false,
        error_message: 'Employee record not found'
      });
      return false;
    }

    const { data: privileges, error } = await supabase
      .from('employee_privileges')
      .select(requiredPrivilege)
      .eq('employee_id', employee.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      await logSecureSecurityEvent({
        action: 'privilege_check_failed',
        resource_type: 'employee_privileges',
        success: false,
        error_message: error.message
      });
      return false;
    }

    const hasPrivilege = privileges?.[requiredPrivilege] === true;
    
    await logSecureSecurityEvent({
      action: 'privilege_checked',
      resource_type: 'employee_privileges',
      success: true,
      metadata: { 
        privilege: requiredPrivilege, 
        granted: hasPrivilege 
      }
    });

    return hasPrivilege;
  } catch (error) {
    await logSecureSecurityEvent({
      action: 'privilege_check_error',
      resource_type: 'employee_privileges',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};
