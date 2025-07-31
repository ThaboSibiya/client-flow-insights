
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DetailedEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation: string;
  title: string;
  department?: string;
  role: string;
  status: string;
  hire_date: string;
  is_invited?: boolean;
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  auth_user_id?: string;
  last_login_at?: string;
}

export const useEmployeeDetails = () => {
  const [detailedEmployees, setDetailedEmployees] = useState<Record<string, DetailedEmployee>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const loadEmployeeDetails = async (employeeIds: string[]) => {
    const idsToLoad = employeeIds.filter(id => !detailedEmployees[id]);
    
    if (idsToLoad.length === 0) return;

    // Set loading state for these IDs
    setLoadingDetails(prev => {
      const newState = { ...prev };
      idsToLoad.forEach(id => newState[id] = true);
      return newState;
    });

    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          email,
          phone,
          designation,
          title,
          department,
          role,
          status,
          hire_date,
          is_invited,
          invitation_sent_at,
          invitation_expires_at,
          auth_user_id,
          last_login_at
        `)
        .in('id', idsToLoad);

      if (error) throw error;

      // Cache the detailed data
      setDetailedEmployees(prev => {
        const newState = { ...prev };
        data?.forEach(employee => {
          newState[employee.id] = employee as DetailedEmployee;
        });
        return newState;
      });
    } catch (error: any) {
      console.error('Error loading employee details:', error);
      toast({
        title: "Error",
        description: "Failed to load employee details",
        variant: "destructive"
      });
    } finally {
      // Clear loading state
      setLoadingDetails(prev => {
        const newState = { ...prev };
        idsToLoad.forEach(id => delete newState[id]);
        return newState;
      });
    }
  };

  return {
    detailedEmployees,
    loadingDetails,
    loadEmployeeDetails
  };
};
