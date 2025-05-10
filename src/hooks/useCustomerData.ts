
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useCustomerData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { user } = useAuth();

  // Fetch customers data from Supabase
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      return;
    }

    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data from Supabase format to our Customer format
          const formattedCustomers: Customer[] = data.map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            status: item.status as CustomerStatus,
            notes: item.notes || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          }));
          
          setCustomers(formattedCustomers);
        }
      } catch (error: any) {
        console.error('Error fetching customers:', error.message);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      }
    };

    fetchCustomers();

    // Set up realtime subscription
    const subscription = supabase
      .channel('customers-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh data when changes occur
          fetchCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { customers, setCustomers };
};
