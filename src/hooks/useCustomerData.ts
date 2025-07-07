
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus, CustomerTicket, TimeEntry } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useCustomerStore } from '@/stores/customerStore';

export const useCustomerData = () => {
  const { user } = useAuth();
  const { customers, setCustomers, setLoading, setError, isLoading } = useCustomerStore();

  // Generate sample ticket data with time tracking for demonstration
  const generateSampleTickets = useCallback((customerId: string): CustomerTicket[] => {
    const sampleTimeEntries: TimeEntry[] = [
      {
        id: 'time-1',
        ticketId: `ticket-${customerId}-1`,
        userId: 'user-1',
        userName: 'John Doe',
        description: 'Initial investigation',
        duration: 45,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'time-2',
        ticketId: `ticket-${customerId}-1`,
        userId: 'user-2',
        userName: 'Jane Smith',
        description: 'Customer follow-up',
        duration: 30,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    ];

    const sampleTickets: CustomerTicket[] = [
      {
        id: `ticket-${customerId}-1`,
        ticketNumber: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'open',
        priority: 'high',
        subject: 'Policy inquiry regarding coverage',
        timeEntries: sampleTimeEntries,
        totalTimeSpent: 75, // 45 + 30 minutes
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: `ticket-${customerId}-2`,
        ticketNumber: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'resolved',
        priority: 'medium',
        subject: 'Documentation request',
        timeEntries: [],
        totalTimeSpent: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];
    
    // Randomly assign tickets to some customers (not all)
    return Math.random() > 0.6 ? sampleTickets : [];
  }, []);

  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setCustomers([]);
      return;
    }

    // Skip loading if we already have data and this isn't a forced refresh
    if (!forceRefresh && customers.length > 0 && !isLoading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching customers for user:', user.id);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Raw customer data from database:', data);

      if (data) {
        const formattedCustomers: Customer[] = data.map(item => {
          const activeTickets = generateSampleTickets(item.id);
          const customer = {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            status: item.status as CustomerStatus,
            notes: item.notes || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            activeTickets,
            ticketCount: activeTickets.length,
            lastTicketDate: activeTickets.length > 0 ? activeTickets[0].createdAt : undefined,
          };
          console.log('Formatted customer:', customer);
          return customer;
        });
        
        console.log('Setting customers in store:', formattedCustomers);
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      setError('Failed to load customers');
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, setCustomers, setLoading, setError, generateSampleTickets, customers.length, isLoading]);

  // Effect for initial data load
  useEffect(() => {
    if (user) {
      console.log('Initial customer data load for user:', user.id);
      fetchCustomers();
    }
    // Clear data on logout
    if (!user) {
      console.log('Clearing customer data due to logout');
      setCustomers([]);
    }
  }, [user, fetchCustomers, setCustomers]);

  // Effect for real-time updates with improved logging
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for customers');
    
    const subscription = supabase
      .channel('customers-channel-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time customer update received:', payload);
          toast({ 
            description: "Customer data updated in real-time.",
            duration: 3000 
          });
          // Force refresh to get latest data
          fetchCustomers(true);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(subscription);
    };
  }, [user, fetchCustomers]);

  // Expose a manual refresh function
  const refreshCustomers = useCallback(() => {
    console.log('Manual customer refresh triggered');
    fetchCustomers(true);
  }, [fetchCustomers]);

  return { 
    customers, 
    isLoading,
    refreshCustomers 
  };
};
