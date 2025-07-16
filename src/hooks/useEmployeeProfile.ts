
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  role: string;
}

interface EmployeeProfileData {
  employee: EmployeeData | null;
  isCompanyOwner: boolean;
}

export const useEmployeeProfile = () => {
  const { user } = useAuth();

  return useQuery<EmployeeProfileData>({
    queryKey: ['employee-profile', user?.id],
    queryFn: async (): Promise<EmployeeProfileData> => {
      if (!user?.id) {
        return { employee: null, isCompanyOwner: false };
      }

      // Check if user is a company owner (has profile)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If user has a profile, they are a company owner
      if (profile) {
        return { employee: null, isCompanyOwner: true };
      }

      // Check if user is an employee
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_number, role')
        .eq('user_id', user.id)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') {
        throw employeeError;
      }

      return {
        employee: employee || null,
        isCompanyOwner: false
      };
    },
    enabled: !!user?.id,
  });
};
