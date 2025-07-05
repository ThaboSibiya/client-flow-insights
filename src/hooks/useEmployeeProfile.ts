
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Check if user is a company owner first (has customers)
const checkIsCompanyOwner = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  return data && data.length > 0;
};

const fetchEmployeeProfile = async (userId: string) => {
  if (!userId) return null;

  // First check if user is company owner - if so, skip employee lookup
  const isOwner = await checkIsCompanyOwner(userId);
  if (isOwner) {
    return { isCompanyOwner: true, employee: null };
  }

  // Look for employee by auth_user_id (not user_id)
  const { data, error } = await supabase
    .from('employees')
    .select('id, role, first_name, last_name, employee_number')
    .eq('auth_user_id', userId)
    .maybeSingle(); // Use maybeSingle to avoid 406 errors

  if (error) {
    console.error('Error fetching employee profile:', error);
    throw error;
  }
  
  return { isCompanyOwner: false, employee: data };
};

export const useEmployeeProfile = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['employeeProfile', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve(null);
      return fetchEmployeeProfile(user.id);
    },
    enabled: !authLoading && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduce retries to avoid performance issues
  });
};
