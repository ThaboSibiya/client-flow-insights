
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  invitation_sent_at: string | null;
  invitation_expires_at: string | null;
  is_invited: boolean;
  auth_user_id: string | null;
  last_login_at: string | null;
}

export const useEmployeeData = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmployees = useCallback(async () => {
    try {
      if (!user) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      // Quick check if user is a company owner before fetching employees
      const { data: customerCheck } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!customerCheck || customerCheck.length === 0) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('employees')
        .select(`
          *,
          invitation_sent_at,
          invitation_expires_at,
          is_invited,
          auth_user_id,
          last_login_at
        `)
        .eq('company_owner_id', user.id);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive"
        });
        return;
      }

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
  }, [user, workspaceId]);

  useEffect(() => {
    fetchEmployees();
  }, [user, fetchEmployees]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    refetch
  };
};
