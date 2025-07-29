
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
    // Use edge function for secure server-side audit logging
    const { error } = await supabase.functions.invoke('log-security-event', {
      body: {
        ...event,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Failed to log security event via edge function:', error);
      // Fallback to client-side logging only as last resort
      fallbackSecurityLogging(event);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
    fallbackSecurityLogging(event);
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

    // Use RPC function for secure privilege checking
    const { data, error } = await supabase.rpc('check_user_privilege', {
      privilege_name: requiredPrivilege
    });

    if (error) {
      await logSecureSecurityEvent({
        action: 'privilege_check_failed',
        resource_type: 'employee_privileges',
        success: false,
        error_message: error.message
      });
      return false;
    }

    const hasPrivilege = data === true;
    
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
