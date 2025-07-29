
import { supabase } from '@/integrations/supabase/client';
import { logSecureSecurityEvent } from './secureSecurityService';
import { validateEmail, validatePhone, sanitizeInput } from '@/utils/securityUtils';

export interface SecurityAuditEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  success?: boolean;
  error_message?: string;
}

// Legacy function - use logSecureSecurityEvent instead
export const logSecurityEvent = async (event: SecurityAuditEvent) => {
  console.warn('Using deprecated logSecurityEvent - please use logSecureSecurityEvent instead');
  await logSecureSecurityEvent({
    ...event,
    success: event.success ?? true
  });
};

// Export security utilities
export { validateEmail, validatePhone, sanitizeInput };

// Enhanced privilege checking with security logging
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

    if (!hasPrivilege) {
      await logSecureSecurityEvent({
        action: 'privilege_denied',
        resource_type: 'employee_privileges',
        success: false,
        metadata: { requested_privilege: requiredPrivilege }
      });
    }

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
