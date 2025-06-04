
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus, CustomerTicket, TimeEntry } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useCustomerData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { user } = useAuth();

  // Generate sample ticket data with time tracking for demonstration
  const generateSampleTickets = (customerId: string): CustomerTicket[] => {
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
  };

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
          const formattedCustomers: Customer[] = data.map(item => {
            const activeTickets = generateSampleTickets(item.id);
            return {
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
          });
          
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
