
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserPrivileges, EmployeePrivileges } from '@/services/employeePrivilegeService';
import { useAuth } from '@/context/AuthContext';

export const useEmployeePrivileges = () => {
  const { user } = useAuth();
  const [privileges, setPrivileges] = useState<EmployeePrivileges | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPrivileges = useCallback(async () => {
    try {
      const userPrivileges = await getCurrentUserPrivileges();
      setPrivileges(userPrivileges);
    } catch (error) {
      console.error('Error loading privileges:', error);
      setPrivileges(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPrivileges();
    } else {
      setPrivileges(null);
      setLoading(false);
    }
  }, [user, loadPrivileges]);

  const hasPrivilege = useCallback((privilege: keyof EmployeePrivileges): boolean => {
    if (!privileges) return false;
    
    const value = privileges[privilege];
    
    // Handle boolean privileges
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Handle string privileges (like scopes) - return true if they exist and are not empty
    if (typeof value === 'string') {
      return value.length > 0;
    }
    
    return false;
  }, [privileges]);

  const canUpdateCustomerStatusOnsite = useCallback(() => 
    hasPrivilege('can_update_customer_status_onsite'), [hasPrivilege]);

  return {
    privileges,
    loading,
    hasPrivilege,
    canUpdateCustomerStatusOnsite,
    refetch: loadPrivileges
  };
};
