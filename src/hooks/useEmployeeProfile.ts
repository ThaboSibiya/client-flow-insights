
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const fetchEmployeeProfile = async (userId: string) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('employees')
    .select('id, role')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // 'exact one row not found'
      console.warn("User is not registered as an employee.");
      return null;
    }
    console.error('Error fetching employee profile:', error);
    throw error;
  }
  return data;
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
  });
};
