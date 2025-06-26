
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      fetchEmployeeProfile();
    } else {
      setEmployeeProfile(null);
      setIsCompanyOwner(false);
      setLoading(false);
    }
  }, [user]);

  const fetchEmployeeProfile = async () => {
    try {
      if (!user) return;

      // First check if user is a company owner (has customers)
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (customerData && customerData.length > 0) {
        setIsCompanyOwner(true);
        setLoading(false);
        return;
      }

      // Check if user is an employee
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User exists but is not an employee - might be company owner without employees
          console.log('User is not registered as an employee');
          setEmployeeProfile(null);
        } else {
          console.error('Error fetching employee profile:', error);
        }
      } else {
        setEmployeeProfile(employee);
        
        // Update last login time
        await supabase
          .from('employees')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', employee.id);
      }
    } catch (error) {
      console.error('Error in fetchEmployeeProfile:', error);
    } finally {
      setLoading(false);
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
    loading,
    isCompanyOwner,
    getAccessLevel,
    canAccessFeature,
    refetch: fetchEmployeeProfile
  };
};
