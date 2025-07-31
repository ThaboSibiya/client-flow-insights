
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface BasicEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  is_invited: boolean;
  auth_user_id: string | null;
}

export const useOptimizedEmployeeData = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<BasicEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);

  const fetchEmployees = async () => {
    try {
      if (!user) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Optimized query - only fetch essential fields for list view
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          email,
          designation,
          role,
          status,
          is_invited,
          auth_user_id
        `)
        .eq('company_owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial load for better performance

      if (error) {
        // If no employees found for this user as company owner, they might be an employee themselves
        if (error.code === 'PGRST116' || (data && data.length === 0)) {
          setIsCompanyOwner(false);
          setEmployees([]);
        } else {
          console.error('Error fetching employees:', error);
          toast({
            title: "Error",
            description: "Failed to load employees",
            variant: "destructive"
          });
        }
        return;
      }

      setIsCompanyOwner(true);
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error", 
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?.id]); // Only depend on user ID change

  const refetch = () => {
    fetchEmployees();
  };

  return {
    employees,
    loading,
    isCompanyOwner,
    refetch
  };
};
