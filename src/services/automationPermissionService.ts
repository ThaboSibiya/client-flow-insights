
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityService';
import { getEnhancedUserPrivileges } from './privilegeService';
import { AutomationPermission } from '@/types/enhancedSecurity';

export const getAutomationPermissions = async (employeeId: string): Promise<AutomationPermission[]> => {
  try {
    const { data, error } = await supabase
      .from('automation_permissions')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(permission => ({
      ...permission,
      permission_level: permission.permission_level as 'view' | 'execute' | 'edit' | 'admin'
    }));
  } catch (error) {
    console.error('Error getting automation permissions:', error);
    return [];
  }
};

export const grantAutomationPermission = async (
  automationId: string,
  employeeId: string,
  permissionLevel: 'view' | 'execute' | 'edit' | 'admin',
  expiresAt?: string
) => {
  try {
    const { error } = await supabase
      .from('automation_permissions')
      .upsert({
        automation_id: automationId,
        employee_id: employeeId,
        permission_level: permissionLevel,
        expires_at: expiresAt
      });

    if (error) throw error;

    await logSecurityEvent({
      action: 'automation_permission_granted',
      resource_type: 'automation_permissions',
      resource_id: `${automationId}-${employeeId}`,
      success: true
    });

    return true;
  } catch (error) {
    console.error('Error granting automation permission:', error);
    await logSecurityEvent({
      action: 'automation_permission_grant_failed',
      resource_type: 'automation_permissions',
      resource_id: `${automationId}-${employeeId}`,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};

export const hasAutomationAccess = async (
  automationId: string,
  requiredLevel: 'view' | 'execute' | 'edit' | 'admin' = 'view'
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!employee) return false;

    // Check direct automation permission
    const { data: permission } = await supabase
      .from('automation_permissions')
      .select('permission_level, expires_at')
      .eq('automation_id', automationId)
      .eq('employee_id', employee.id)
      .single();

    if (permission) {
      // Check if permission is expired
      if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
        return false;
      }

      const levels = ['view', 'execute', 'edit', 'admin'];
      const hasLevel = levels.indexOf(permission.permission_level);
      const requiresLevel = levels.indexOf(requiredLevel);
      return hasLevel >= requiresLevel;
    }

    // Check general automation privileges
    const privileges = await getEnhancedUserPrivileges();
    if (!privileges) return false;

    switch (requiredLevel) {
      case 'view':
        return privileges.can_view_automations;
      case 'execute':
        return privileges.can_execute_automations;
      case 'edit':
        return privileges.can_edit_automations;
      case 'admin':
        return privileges.can_delete_automations || privileges.can_manage_automation_permissions;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking automation access:', error);
    return false;
  }
};
