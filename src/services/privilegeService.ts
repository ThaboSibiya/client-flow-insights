
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { logSecureSecurityEvent } from './secureSecurityService';

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
  requires_financial_approval: true,
  // AI Agent — employees get chat + create by default
  can_use_ai_agent: true,
  can_create_ai_workflows: true
});

export const getEnhancedUserPrivileges = async (): Promise<EnhancedEmployeePrivileges | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await logSecureSecurityEvent({
        action: 'privilege_check_no_user',
        resource_type: 'employee_privileges',
        success: false,
        error_message: 'No authenticated user'
      });
      return null;
    }

    // Use secure helper function to get employee ID
    const { data: employeeId, error: employeeError } = await supabase.rpc('current_employee_id');
    
    if (employeeError || !employeeId) {
      await logSecureSecurityEvent({
        action: 'privilege_check_no_employee',
        resource_type: 'employee_privileges',
        success: false,
        error_message: 'Employee record not found'
      });
      return null;
    }

    const { data: privileges, error } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error) {
      await logSecureSecurityEvent({
        action: 'privilege_fetch_failed',
        resource_type: 'employee_privileges',
        success: false,
        error_message: error.message
      });
      return null;
    }

    if (!privileges) {
      return getDefaultPrivileges();
    }

    await logSecureSecurityEvent({
      action: 'privileges_fetched_successfully',
      resource_type: 'employee_privileges',
      success: true,
      metadata: { employee_id: employeeId }
    });

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
      requires_financial_approval: privileges.requires_financial_approval !== false,
      can_use_ai_agent: (privileges as any).can_use_ai_agent !== false,
      can_create_ai_workflows: (privileges as any).can_create_ai_workflows !== false
    };
  } catch (error) {
    await logSecureSecurityEvent({
      action: 'privilege_fetch_error',
      resource_type: 'employee_privileges',
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};
