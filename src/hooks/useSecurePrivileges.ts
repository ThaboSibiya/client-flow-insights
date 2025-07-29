
import { useState, useEffect } from 'react';
import { getEnhancedUserPrivileges } from '@/services/enhancedPrivilegeService';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';

export const useSecurePrivileges = () => {
  const [privileges, setPrivileges] = useState<EnhancedEmployeePrivileges | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrivileges = async () => {
      try {
        const userPrivileges = await getEnhancedUserPrivileges();
        setPrivileges(userPrivileges);
      } catch (error) {
        await logSecureSecurityEvent({
          action: 'privileges_load_failed',
          resource_type: 'employee_privileges',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error('Failed to load user privileges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrivileges();
  }, []);

  const hasPrivilege = (privilegeName: keyof EnhancedEmployeePrivileges): boolean => {
    if (!privileges) return false;
    return Boolean(privileges[privilegeName]);
  };

  const hasAnyPrivilege = (privilegeNames: (keyof EnhancedEmployeePrivileges)[]): boolean => {
    if (!privileges) return false;
    return privilegeNames.some(name => Boolean(privileges[name]));
  };

  const hasAllPrivileges = (privilegeNames: (keyof EnhancedEmployeePrivileges)[]): boolean => {
    if (!privileges) return false;
    return privilegeNames.every(name => Boolean(privileges[name]));
  };

  return {
    privileges,
    loading,
    hasPrivilege,
    hasAnyPrivilege,
    hasAllPrivileges
  };
};
