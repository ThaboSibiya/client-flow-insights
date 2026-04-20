
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { getDefaultPrivileges } from '@/services/privilegeService';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';
import { useAuth } from '@/context/AuthContext';

export const useSecurePrivileges = () => {
  const { user } = useAuth();
  const [privileges, setPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurePrivileges();
    } else {
      setPrivileges(getDefaultPrivileges());
      setLoading(false);
    }
  }, [user]);

  const loadSecurePrivileges = async () => {
    try {
      if (!user) return;

      // Use the secure helper function to get current employee ID
      const { data: employeeId, error: employeeError } = await supabase.rpc('current_employee_id');
      
      if (employeeError) {
        // User might not be an employee - check if they're a company owner
        const { data: isOwner } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (isOwner && isOwner.length > 0) {
          // Company owners have all privileges - fix type issues
          const defaultPrivileges = getDefaultPrivileges();
          const ownerPrivileges: EnhancedEmployeePrivileges = {
            ...defaultPrivileges,
            // Set all boolean privileges to true
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
            // Set scope properties correctly
            automation_scope: 'all_company',
            customer_access_scope: 'all_company'
          };
          
          setPrivileges(ownerPrivileges);
          
          await logSecureSecurityEvent({
            action: 'privileges_loaded_owner',
            resource_type: 'employee_privileges',
            success: true
          });
        } else {
          await logSecureSecurityEvent({
            action: 'privileges_load_no_employee',
            resource_type: 'employee_privileges',
            success: false,
            error_message: 'User is not an employee or company owner'
          });
        }
        return;
      }

      if (!employeeId) {
        setPrivileges(getDefaultPrivileges());
        return;
      }

      // Load employee privileges using secure query
      const { data: privilegeData, error } = await supabase
        .from('employee_privileges')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) {
        console.error('Error loading secure privileges:', error);
        await logSecureSecurityEvent({
          action: 'privileges_load_failed',
          resource_type: 'employee_privileges',
          success: false,
          error_message: error.message
        });
        setPrivileges(getDefaultPrivileges());
        return;
      }

      const currentPrivileges = privilegeData ? {
        can_view_customers: privilegeData.can_view_customers || false,
        can_edit_customers: privilegeData.can_edit_customers || false,
        can_delete_customers: privilegeData.can_delete_customers || false,
        can_view_quotes: privilegeData.can_view_quotes || false,
        can_create_quotes: privilegeData.can_create_quotes || false,
        can_edit_quotes: privilegeData.can_edit_quotes || false,
        can_delete_quotes: privilegeData.can_delete_quotes || false,
        can_view_analytics: privilegeData.can_view_analytics || false,
        can_manage_employees: privilegeData.can_manage_employees || false,
        can_update_customer_status_onsite: privilegeData.can_update_customer_status_onsite || false,
        can_view_automations: privilegeData.can_view_automations || false,
        can_create_automations: privilegeData.can_create_automations || false,
        can_edit_automations: privilegeData.can_edit_automations || false,
        can_delete_automations: privilegeData.can_delete_automations || false,
        can_execute_automations: privilegeData.can_execute_automations || false,
        can_manage_automation_permissions: privilegeData.can_manage_automation_permissions || false,
        automation_scope: (privilegeData.automation_scope as 'own_customers' | 'department' | 'all_company') || 'own_customers',
        can_access_sensitive_automations: privilegeData.can_access_sensitive_automations || false,
        can_view_company_settings: privilegeData.can_view_company_settings || false,
        can_edit_basic_settings: privilegeData.can_edit_basic_settings || false,
        can_edit_integration_settings: privilegeData.can_edit_integration_settings || false,
        can_edit_security_settings: privilegeData.can_edit_security_settings || false,
        can_edit_billing_settings: privilegeData.can_edit_billing_settings || false,
        can_manage_employee_settings: privilegeData.can_manage_employee_settings || false,
        customer_access_scope: (privilegeData.customer_access_scope as 'assigned_only' | 'team' | 'department' | 'all_company') || 'assigned_only',
        can_access_customer_pii: privilegeData.can_access_customer_pii || false,
        can_export_customer_data: privilegeData.can_export_customer_data || false,
        can_access_financial_automations: privilegeData.can_access_financial_automations || false,
        can_modify_pricing_automations: privilegeData.can_modify_pricing_automations || false,
        requires_financial_approval: privilegeData.requires_financial_approval !== false,
        can_use_ai_agent: (privilegeData as any).can_use_ai_agent !== false,
        can_create_ai_workflows: (privilegeData as any).can_create_ai_workflows !== false
      } : getDefaultPrivileges();

      setPrivileges(currentPrivileges);

      await logSecureSecurityEvent({
        action: 'privileges_loaded_successfully',
        resource_type: 'employee_privileges',
        success: true,
        metadata: { employee_id: employeeId }
      });

    } catch (error) {
      console.error('Error in loadSecurePrivileges:', error);
      await logSecureSecurityEvent({
        action: 'privileges_load_error',
        resource_type: 'employee_privileges',
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      setPrivileges(getDefaultPrivileges());
    } finally {
      setLoading(false);
    }
  };

  const hasPrivilege = (privilege: keyof EnhancedEmployeePrivileges): boolean => {
    const hasAccess = Boolean(privileges[privilege]);
    
    // Log privilege access checks for audit purposes
    if (!hasAccess) {
      logSecureSecurityEvent({
        action: 'privilege_access_denied',
        resource_type: 'employee_privileges',
        success: false,
        metadata: { requested_privilege: privilege }
      });
    }
    
    return hasAccess;
  };

  return {
    privileges,
    loading,
    hasPrivilege,
    refetch: loadSecurePrivileges
  };
};
