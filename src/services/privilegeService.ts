
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityService';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';

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
      automation_scope: (privileges.automation_scope as 'own_customers' | 'department' | 'all_company') || 'own_customers',
      can_access_sensitive_automations: privileges.can_access_sensitive_automations || false,
      can_view_company_settings: privileges.can_view_company_settings || false,
      can_edit_basic_settings: privileges.can_edit_basic_settings || false,
      can_edit_integration_settings: privileges.can_edit_integration_settings || false,
      can_edit_security_settings: privileges.can_edit_security_settings || false,
      can_edit_billing_settings: privileges.can_edit_billing_settings || false,
      can_manage_employee_settings: privileges.can_manage_employee_settings || false,
      customer_access_scope: (privileges.customer_access_scope as 'assigned_only' | 'team' | 'department' | 'all_company') || 'assigned_only',
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
