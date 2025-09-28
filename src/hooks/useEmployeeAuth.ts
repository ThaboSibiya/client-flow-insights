
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);

  const fetchEmployeeProfile = useCallback(async () => {
    try {
      if (!user) return;

      // First, quickly check if user is a company owner by checking if they have customers
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!customerError && customerData && customerData.length > 0) {
        setIsCompanyOwner(true);
        setLoading(false);
        return;
      }

      // Only if not a company owner, check for employee profile
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User exists but is not an employee and has no customers - might be a new user
          setEmployeeProfile(null);
        } else {
          console.error('Error fetching employee profile:', error);
        }
      } else {
        setEmployeeProfile(employee);
        
        // Note: Login time will be updated server-side via triggers or edge functions
      }
    } catch (error) {
      console.error('Error in fetchEmployeeProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEmployeeProfile();
    } else {
      setEmployeeProfile(null);
      setIsCompanyOwner(false);
      setLoading(false);
    }
  }, [user, fetchEmployeeProfile]);

  const getAccessLevel = useCallback((): string => {
    if (isCompanyOwner) return 'owner';
    if (!employeeProfile) return 'none';
    return employeeProfile.role;
  }, [isCompanyOwner, employeeProfile]);

  const canAccessFeature = useCallback((feature: string): boolean => {
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
  }, [getAccessLevel]);

  return {
    employeeProfile,
    loading,
    isCompanyOwner,
    getAccessLevel,
    canAccessFeature,
    refetch: fetchEmployeeProfile
  };
};
