
import { useState, useEffect } from 'react';
import { getCurrentUserPrivileges, EmployeePrivileges } from '@/services/employeePrivilegeService';
import { useAuth } from '@/context/AuthContext';

export const useEmployeePrivileges = () => {
  const { user } = useAuth();
  const [privileges, setPrivileges] = useState<EmployeePrivileges | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrivileges();
    } else {
      setPrivileges(null);
      setLoading(false);
    }
  }, [user]);

  const loadPrivileges = async () => {
    try {
      const userPrivileges = await getCurrentUserPrivileges();
      setPrivileges(userPrivileges);
    } catch (error) {
      console.error('Error loading privileges:', error);
      setPrivileges(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPrivilege = (privilege: keyof EmployeePrivileges): boolean => {
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
  };

  const canUpdateCustomerStatusOnsite = hasPrivilege('can_update_customer_status_onsite');

  return {
    privileges,
    loading,
    hasPrivilege,
    canUpdateCustomerStatusOnsite,
    refetch: loadPrivileges
  };
};
