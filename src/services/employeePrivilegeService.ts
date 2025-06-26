
import { supabase } from '@/integrations/supabase/client';

export interface EmployeePrivileges {
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
  can_view_automations: boolean;
  can_create_automations: boolean;
  can_edit_automations: boolean;
  can_delete_automations: boolean;
  can_execute_automations: boolean;
  can_manage_automation_permissions: boolean;
  can_access_sensitive_automations: boolean;
  can_view_company_settings: boolean;
  can_edit_basic_settings: boolean;
  can_edit_integration_settings: boolean;
  can_edit_security_settings: boolean;
  can_edit_billing_settings: boolean;
  can_manage_employee_settings: boolean;
  can_access_customer_pii: boolean;
  can_export_customer_data: boolean;
  can_access_financial_automations: boolean;
  can_modify_pricing_automations: boolean;
  requires_financial_approval: boolean;
  automation_scope: string;
  customer_access_scope: string;
}

export const getCurrentUserPrivileges = async (): Promise<EmployeePrivileges | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user is company owner first
    const { data: customerData } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (customerData && customerData.length > 0) {
      // Company owner has all privileges
      return {
        can_view_customers: true,
        can_edit_customers: true,
        can_delete_customers: true,
        can_view_quotes: true,
        can_create_quotes: true,
        can_edit_quotes: true,
        can_delete_quotes: true,
        can_view_analytics: true,
        can_manage_employees: true,
        can_update_customer_status_onsite: true,
        can_view_automations: true,
        can_create_automations: true,
        can_edit_automations: true,
        can_delete_automations: true,
        can_execute_automations: true,
        can_manage_automation_permissions: true,
        can_access_sensitive_automations: true,
        can_view_company_settings: true,
        can_edit_basic_settings: true,
        can_edit_integration_settings: true,
        can_edit_security_settings: true,
        can_edit_billing_settings: true,
        can_manage_employee_settings: true,
        can_access_customer_pii: true,
        can_export_customer_data: true,
        can_access_financial_automations: true,
        can_modify_pricing_automations: true,
        requires_financial_approval: false,
        automation_scope: 'all_company',
        customer_access_scope: 'all_company'
      };
    }

    // Get employee privileges
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (!employee) return null;

    const { data: privileges } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    if (!privileges) {
      // Return default privileges based on role
      return getDefaultPrivilegesByRole(employee.role);
    }

    return privileges;
  } catch (error) {
    console.error('Error fetching user privileges:', error);
    return null;
  }
};

const getDefaultPrivilegesByRole = (role: string): EmployeePrivileges => {
  const basePrivileges: EmployeePrivileges = {
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
    can_access_sensitive_automations: false,
    can_view_company_settings: false,
    can_edit_basic_settings: false,
    can_edit_integration_settings: false,
    can_edit_security_settings: false,
    can_edit_billing_settings: false,
    can_manage_employee_settings: false,
    can_access_customer_pii: false,
    can_export_customer_data: false,
    can_access_financial_automations: false,
    can_modify_pricing_automations: false,
    requires_financial_approval: true,
    automation_scope: 'own_customers',
    customer_access_scope: 'assigned_only'
  };

  switch (role) {
    case 'admin':
      return {
        ...basePrivileges,
        can_view_customers: true,
        can_edit_customers: true,
        can_delete_customers: true,
        can_view_quotes: true,
        can_create_quotes: true,
        can_edit_quotes: true,
        can_delete_quotes: true,
        can_view_analytics: true,
        can_manage_employees: true,
        can_update_customer_status_onsite: true,
        can_view_automations: true,
        can_create_automations: true,
        can_edit_automations: true,
        can_delete_automations: true,
        can_execute_automations: true,
        can_manage_automation_permissions: true,
        can_access_sensitive_automations: true,
        can_view_company_settings: true,
        can_edit_basic_settings: true,
        can_edit_integration_settings: true,
        can_access_customer_pii: true,
        can_export_customer_data: true,
        requires_financial_approval: false,
        automation_scope: 'all_company',
        customer_access_scope: 'all_company'
      };

    case 'manager':
      return {
        ...basePrivileges,
        can_view_customers: true,
        can_edit_customers: true,
        can_view_quotes: true,
        can_create_quotes: true,
        can_edit_quotes: true,
        can_view_analytics: true,
        can_update_customer_status_onsite: true,
        can_view_automations: true,
        can_execute_automations: true,
        can_access_customer_pii: true,
        automation_scope: 'department',
        customer_access_scope: 'department'
      };

    case 'supervisor':
      return {
        ...basePrivileges,
        can_view_customers: true,
        can_edit_customers: true,
        can_view_quotes: true,
        can_create_quotes: true,
        can_edit_quotes: true,
        can_view_analytics: true,
        can_update_customer_status_onsite: true,
        can_execute_automations: true,
        automation_scope: 'team',
        customer_access_scope: 'team'
      };

    case 'employee':
      return {
        ...basePrivileges,
        can_view_customers: true,
        can_edit_customers: true,
        can_view_quotes: true,
        can_create_quotes: true,
        can_update_customer_status_onsite: true,
        can_execute_automations: true,
        automation_scope: 'own_customers',
        customer_access_scope: 'assigned_only'
      };

    default:
      return basePrivileges;
  }
};
