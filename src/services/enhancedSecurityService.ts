import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityService';

export interface EnhancedEmployeePrivileges {
  // Existing privileges
  can_view_customers: boolean;
  can_edit_customers: boolean;
  can_delete_customers: boolean;
  can_view_quotes: boolean;
  can_create_quotes: boolean;
  can_edit_quotes: boolean;
  can_delete_quotes: boolean;
  can_view_analytics: boolean;
  can_manage_employees: boolean;
  can_update_customer_status_onsite: boolean;
  
  // New automation privileges
  can_view_automations: boolean;
  can_create_automations: boolean;
  can_edit_automations: boolean;
  can_delete_automations: boolean;
  can_execute_automations: boolean;
  can_manage_automation_permissions: boolean;
  automation_scope: 'own_customers' | 'department' | 'all_company';
  can_access_sensitive_automations: boolean;
  
  // New granular settings privileges
  can_view_company_settings: boolean;
  can_edit_basic_settings: boolean;
  can_edit_integration_settings: boolean;
  can_edit_security_settings: boolean;
  can_edit_billing_settings: boolean;
  can_manage_employee_settings: boolean;
  
  // Data access controls
  customer_access_scope: 'assigned_only' | 'team' | 'department' | 'all_company';
  can_access_customer_pii: boolean;
  can_export_customer_data: boolean;
  
  // Financial controls
  can_access_financial_automations: boolean;
  can_modify_pricing_automations: boolean;
  requires_financial_approval: boolean;
}

export interface AutomationPermission {
  id: string;
  automation_id: string;
  employee_id: string;
  permission_level: 'view' | 'execute' | 'edit' | 'admin';
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
}

export interface PrivilegeChangeAudit {
  id: string;
  employee_id: string;
  changed_by: string;
  privilege_name: string;
  old_value?: boolean;
  new_value?: boolean;
  reason?: string;
  ip_address?: string;
  created_at: string;
}

export const getEnhancedUserPrivileges = async (): Promise<EnhancedEmployeePrivileges | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!employee) return null;

    const { data: privileges } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    if (!privileges) {
      return getDefaultPrivileges();
    }

    return {
      can_view_customers: privileges.can_view_customers || false,
      can_edit_customers: privileges.can_edit_customers || false,
      can_delete_customers: privileges.can_delete_customers || false,
      can_view_quotes: privileges.can_view_quotes || false,
      can_create_quotes: privileges.can_create_quotes || false,
      can_edit_quotes: privileges.can_edit_quotes || false,
      can_delete_quotes: privileges.can_delete_quotes || false,
      can_view_analytics: privileges.can_view_analytics || false,
      can_manage_employees: privileges.can_manage_employees || false,
      can_update_customer_status_onsite: privileges.can_update_customer_status_onsite || false,
      can_view_automations: privileges.can_view_automations || false,
      can_create_automations: privileges.can_create_automations || false,
      can_edit_automations: privileges.can_edit_automations || false,
      can_delete_automations: privileges.can_delete_automations || false,
      can_execute_automations: privileges.can_execute_automations || false,
      can_manage_automation_permissions: privileges.can_manage_automation_permissions || false,
      automation_scope: privileges.automation_scope || 'own_customers',
      can_access_sensitive_automations: privileges.can_access_sensitive_automations || false,
      can_view_company_settings: privileges.can_view_company_settings || false,
      can_edit_basic_settings: privileges.can_edit_basic_settings || false,
      can_edit_integration_settings: privileges.can_edit_integration_settings || false,
      can_edit_security_settings: privileges.can_edit_security_settings || false,
      can_edit_billing_settings: privileges.can_edit_billing_settings || false,
      can_manage_employee_settings: privileges.can_manage_employee_settings || false,
      customer_access_scope: privileges.customer_access_scope || 'assigned_only',
      can_access_customer_pii: privileges.can_access_customer_pii || false,
      can_export_customer_data: privileges.can_export_customer_data || false,
      can_access_financial_automations: privileges.can_access_financial_automations || false,
      can_modify_pricing_automations: privileges.can_modify_pricing_automations || false,
      requires_financial_approval: privileges.requires_financial_approval !== false
    };
  } catch (error) {
    console.error('Error getting enhanced user privileges:', error);
    await logSecurityEvent({
      action: 'enhanced_privilege_check_failed',
      resource_type: 'employee_privileges',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};

export const getDefaultPrivileges = (): EnhancedEmployeePrivileges => ({
  can_view_customers: false,
  can_edit_customers: false,
  can_delete_customers: false,
  can_view_quotes: false,
  can_create_quotes: false,
  can_edit_quotes: false,
  can_delete_quotes: false,
  can_view_analytics: false,
  can_manage_employees: false,
  can_update_customer_status_onsite: false,
  can_view_automations: false,
  can_create_automations: false,
  can_edit_automations: false,
  can_delete_automations: false,
  can_execute_automations: false,
  can_manage_automation_permissions: false,
  automation_scope: 'own_customers',
  can_access_sensitive_automations: false,
  can_view_company_settings: false,
  can_edit_basic_settings: false,
  can_edit_integration_settings: false,
  can_edit_security_settings: false,
  can_edit_billing_settings: false,
  can_manage_employee_settings: false,
  customer_access_scope: 'assigned_only',
  can_access_customer_pii: false,
  can_export_customer_data: false,
  can_access_financial_automations: false,
  can_modify_pricing_automations: false,
  requires_financial_approval: true
});

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

export const getAutomationPermissions = async (employeeId: string): Promise<AutomationPermission[]> => {
  try {
    const { data, error } = await supabase
      .from('automation_permissions')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
