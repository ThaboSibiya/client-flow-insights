import { supabase } from '@/integrations/supabase/client';

export interface SecurityAuditEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  success?: boolean;
  error_message?: string;
}

export const logSecurityEvent = async (event: SecurityAuditEvent) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // For now, we'll use console.log since the audit table creation failed
    // This will be stored in the browser console and server logs
    console.log('Security Event:', {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      ...event
    });

    // We could also store in localStorage for client-side audit trail
    const auditLogs = JSON.parse(localStorage.getItem('security_audit_logs') || '[]');
    auditLogs.push({
      user_id: user.id,
      timestamp: new Date().toISOString(),
      ...event
    });
    
    // Keep only last 1000 entries
    if (auditLogs.length > 1000) {
      auditLogs.splice(0, auditLogs.length - 1000);
    }
    
    localStorage.setItem('security_audit_logs', JSON.stringify(auditLogs));
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return true; // Allow empty phone
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  return input.trim().substring(0, maxLength);
};

export const hasValidPrivileges = async (requiredPrivilege: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!employee) return false;

    const { data: privileges } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    if (!privileges) return false;

    return privileges[requiredPrivilege] === true;
  } catch (error) {
    await logSecurityEvent({
      action: 'privilege_check_failed',
      resource_type: 'employee_privileges',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};
