
import { useState, useEffect } from 'react';
import { getEnhancedUserPrivileges, getDefaultPrivileges } from '@/services/privilegeService';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { useAuth } from '@/context/AuthContext';

export const useEnhancedPrivileges = (enabled = true) => {
  const { user } = useAuth();
  const [privileges, setPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (user) {
      loadPrivileges();
    } else {
      setPrivileges(getDefaultPrivileges());
      setLoading(false);
    }
  }, [user, enabled]);

  const loadPrivileges = async () => {
    try {
      const userPrivileges = await getEnhancedUserPrivileges();
      setPrivileges(userPrivileges || getDefaultPrivileges());
    } catch (error) {
      console.error('Error loading enhanced privileges:', error);
      setPrivileges(getDefaultPrivileges());
    } finally {
      setLoading(false);
    }
  };

  const hasPrivilege = (privilege: keyof EnhancedEmployeePrivileges): boolean => {
    return Boolean(privileges[privilege]);
  };

  const hasAnyAutomationPrivilege = (): boolean => {
    return privileges.can_view_automations || 
           privileges.can_create_automations || 
           privileges.can_edit_automations || 
           privileges.can_execute_automations;
  };

  const hasAnySettingsPrivilege = (): boolean => {
    return privileges.can_view_company_settings ||
           privileges.can_edit_basic_settings ||
           privileges.can_edit_integration_settings ||
           privileges.can_edit_security_settings ||
           privileges.can_edit_billing_settings ||
           privileges.can_manage_employee_settings;
  };

  const canAccessAutomationLevel = (level: 'view' | 'create' | 'edit' | 'delete' | 'execute'): boolean => {
    switch (level) {
      case 'view':
        return privileges.can_view_automations;
      case 'create':
        return privileges.can_create_automations;
      case 'edit':
        return privileges.can_edit_automations;
      case 'delete':
        return privileges.can_delete_automations;
      case 'execute':
        return privileges.can_execute_automations;
      default:
        return false;
    }
  };

  const canAccessSettingsLevel = (level: 'view' | 'basic' | 'integration' | 'security' | 'billing' | 'employee'): boolean => {
    switch (level) {
      case 'view':
        return privileges.can_view_company_settings;
      case 'basic':
        return privileges.can_edit_basic_settings;
      case 'integration':
        return privileges.can_edit_integration_settings;
      case 'security':
        return privileges.can_edit_security_settings;
      case 'billing':
        return privileges.can_edit_billing_settings;
      case 'employee':
        return privileges.can_manage_employee_settings;
      default:
        return false;
    }
  };

  return {
    privileges,
    loading,
    hasPrivilege,
    hasAnyAutomationPrivilege,
    hasAnySettingsPrivilege,
    canAccessAutomationLevel,
    canAccessSettingsLevel,
    refetch: loadPrivileges
  };
};
