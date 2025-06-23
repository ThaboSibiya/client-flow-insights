
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityService';

export const logPrivilegeChange = async (
  employeeId: string,
  privilegeName: string,
  oldValue: boolean,
  newValue: boolean,
  reason?: string
) => {
  try {
    await supabase.rpc('log_privilege_change', {
      p_employee_id: employeeId,
      p_privilege_name: privilegeName,
      p_old_value: oldValue,
      p_new_value: newValue,
      p_reason: reason
    });

    await logSecurityEvent({
      action: 'privilege_changed',
      resource_type: 'employee_privileges',
      resource_id: employeeId,
      success: true
    });
  } catch (error) {
    console.error('Error logging privilege change:', error);
    await logSecurityEvent({
      action: 'privilege_change_log_failed',
      resource_type: 'employee_privileges',
      resource_id: employeeId,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
