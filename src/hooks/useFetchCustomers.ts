import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_id: string;
}

export const useFetchCustomers = () => {
  const { user } = useAuth();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, user_id')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(error.message);
      }
      
      return data as Customer[];
    },
    enabled: !!user,
  });

  return {
    customers: customers || [],
    isLoading,
    error,
  };
};
