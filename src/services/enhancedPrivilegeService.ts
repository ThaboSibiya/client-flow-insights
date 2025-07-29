
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { logSecureSecurityEvent } from './secureSecurityService';

export const getEnhancedUserPrivileges = async (): Promise<EnhancedEmployeePrivileges | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user privileges from employee_privileges table
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!employee) {
      await logSecureSecurityEvent({
        action: 'get_privileges_failed',
        resource_type: 'employee_privileges', 
        success: false,
        error_message: 'Employee record not found'
      });
      return null;
    }

    const { data, error } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employee.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      await logSecureSecurityEvent({
        action: 'get_privileges_failed',
        resource_type: 'employee_privileges', 
        success: false,
        error_message: error.message
      });
      throw error;
    }

    await logSecureSecurityEvent({
      action: 'privileges_accessed',
      resource_type: 'employee_privileges',
      success: true
    });

    // Map database fields to EnhancedEmployeePrivileges interface
    if (!data) return getDefaultPrivileges();

    return {
      can_view_customers: data.can_view_customers || false,
      can_edit_customers: data.can_edit_customers || false,
      can_delete_customers: data.can_delete_customers || false,
      can_view_quotes: data.can_view_quotes || false,
      can_create_quotes: data.can_create_quotes || false,
      can_edit_quotes: data.can_edit_quotes || false,
      can_delete_quotes: data.can_delete_quotes || false,
      can_view_analytics: data.can_view_analytics || false,
      can_manage_employees: data.can_manage_employees || false,
      can_update_customer_status_onsite: data.can_update_customer_status_onsite || false,
      can_view_automations: data.can_view_automations || false,
      can_create_automations: data.can_create_automations || false,
      can_edit_automations: data.can_edit_automations || false,
      can_delete_automations: data.can_delete_automations || false,
      can_execute_automations: data.can_execute_automations || false,
      can_manage_automation_permissions: data.can_manage_automation_permissions || false,
      automation_scope: (data.automation_scope as 'own_customers' | 'department' | 'all_company') || 'own_customers',
      can_access_sensitive_automations: data.can_access_sensitive_automations || false,
      can_view_company_settings: data.can_view_company_settings || false,
      can_edit_basic_settings: data.can_edit_basic_settings || false,
      can_edit_integration_settings: data.can_edit_integration_settings || false,
      can_edit_security_settings: data.can_edit_security_settings || false,
      can_edit_billing_settings: data.can_edit_billing_settings || false,
      can_manage_employee_settings: data.can_manage_employee_settings || false,
      customer_access_scope: (data.customer_access_scope as 'assigned_only' | 'team' | 'department' | 'all_company') || 'assigned_only',
      can_access_customer_pii: data.can_access_customer_pii || false,
      can_export_customer_data: data.can_export_customer_data || false,
      can_access_financial_automations: data.can_access_financial_automations || false,
      can_modify_pricing_automations: data.can_modify_pricing_automations || false,
      requires_financial_approval: data.requires_financial_approval !== false
    } as EnhancedEmployeePrivileges;
  } catch (error) {
    console.error('Error fetching enhanced user privileges:', error);
    return null;
  }
};

export const getDefaultPrivileges = (): EnhancedEmployeePrivileges => {
  return {
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
  };
};
