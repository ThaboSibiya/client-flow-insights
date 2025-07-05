
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeProfile } from './useEmployeeProfile';

export interface EmployeeProfile {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  designation: string;
  title: string;
  department?: string;
  company_owner_id: string;
  auth_user_id: string;
  last_login_at?: string;
}

export const useEmployeeAuth = () => {
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading, error: profileError } = useEmployeeProfile();
  
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);

  useEffect(() => {
    if (profileData) {
      setIsCompanyOwner(profileData.isCompanyOwner);
      
      if (profileData.employee) {
        // Map the limited employee data to full profile structure
        setEmployeeProfile({
          id: profileData.employee.id,
          role: profileData.employee.role,
          first_name: profileData.employee.first_name,
          last_name: profileData.employee.last_name,
          employee_number: profileData.employee.employee_number,
          // Set reasonable defaults for missing fields
          email: user?.email || '',
          designation: '',
          title: '',
          company_owner_id: '',
          auth_user_id: user?.id || '',
        });
        
        // Update last login time (non-blocking)
        updateLastLogin(profileData.employee.id);
      } else {
        setEmployeeProfile(null);
      }
    } else if (profileData === null) {
      // No profile data means user is not an employee or owner
      setIsCompanyOwner(false);
      setEmployeeProfile(null);
    }
  }, [profileData, user]);

  const updateLastLogin = async (employeeId: string) => {
    try {
      await supabase
        .from('employees')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', employeeId);
    } catch (error) {
      // Silently handle login update errors
      console.debug('Could not update last login:', error);
    }
  };

  const getAccessLevel = () => {
    if (isCompanyOwner) return 'owner';
    if (!employeeProfile) return 'none';
    return employeeProfile.role;
  };

  const canAccessFeature = (feature: string): boolean => {
    const accessLevel = getAccessLevel();
    
    if (accessLevel === 'owner' || accessLevel === 'admin') {
      return true;
    }

    // Feature-specific access control
    const featurePermissions: Record<string, string[]> = {
      'manage_employees': ['owner', 'admin'],
      'view_analytics': ['owner', 'admin', 'manager'],
      'manage_customers': ['owner', 'admin', 'manager', 'supervisor'],
      'create_quotes': ['owner', 'admin', 'manager', 'supervisor', 'employee'],
      'view_conversations': ['owner', 'admin', 'manager', 'supervisor', 'employee'],
    };

    const allowedRoles = featurePermissions[feature] || [];
    return allowedRoles.includes(accessLevel);
  };

  return {
    employeeProfile,
    loading: profileLoading,
    isCompanyOwner,
    getAccessLevel,
    canAccessFeature,
    refetch: () => {
      // Refetch will be handled by React Query automatically
      // or we can trigger a refetch of the profile query
    }
  };
};
