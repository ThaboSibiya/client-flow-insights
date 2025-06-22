
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '../types';
import { CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

export const useCustomerData = (isOpen: boolean) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to continue");
        return;
      }

      console.log('Current user:', user.id);

      // Try to get the employee record, but handle if it doesn't exist
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let companyOwnerId = user.id; // Default to current user

      if (employeeError && employeeError.code !== 'PGRST116') {
        console.warn('Employee lookup error:', employeeError);
        toast({
          title: "Notice",
          description: "Using your account as company owner. If you're an employee, please contact your administrator.",
        });
      } else if (employee) {
        companyOwnerId = employee.company_owner_id;
        console.log('Found employee record, company owner:', companyOwnerId);
      } else {
        console.log('No employee record found, using current user as company owner');
        toast({
          title: "Notice", 
          description: "No employee record found. Using your account as company owner.",
        });
      }

      // Get customers for the company
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', companyOwnerId)
        .order('name');

      if (error) throw error;

      const formattedCustomers: Customer[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        status: item.status as CustomerStatus,
        notes: item.notes || ''
      }));

      console.log('Loaded customers:', formattedCustomers.length);
      setCustomers(formattedCustomers);

      if (formattedCustomers.length === 0) {
        setError("No customers found. Please add customers first.");
      }

    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError(`Failed to load customers: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error
  };
};
