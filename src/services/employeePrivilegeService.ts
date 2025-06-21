
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
  can_manage_company_settings: boolean;
  can_update_customer_status_onsite: boolean;
}

export const getCurrentUserPrivileges = async (): Promise<EmployeePrivileges | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get employee record
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!employee) return null;

    // Get privileges
    const { data: privileges } = await supabase
      .from('employee_privileges')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    if (!privileges) {
      // Return default privileges if none found
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
        can_manage_company_settings: false,
        can_update_customer_status_onsite: false
      };
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
      can_manage_company_settings: privileges.can_manage_company_settings || false,
      can_update_customer_status_onsite: privileges.can_update_customer_status_onsite || false
    };
  } catch (error) {
    console.error('Error getting user privileges:', error);
    return null;
  }
};

export const hasPrivilege = async (privilege: keyof EmployeePrivileges): Promise<boolean> => {
  const privileges = await getCurrentUserPrivileges();
  return privileges?.[privilege] || false;
};
