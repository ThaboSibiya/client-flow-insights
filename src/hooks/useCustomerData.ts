
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus, CustomerTicket, TimeEntry } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
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

  const fetchCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch customers with all necessary data in one query to avoid N+1 problems
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_templates(
            template_id,
            industry_templates(id, name, industry)
          ),
          customer_custom_data(
            id,
            field_id,
            field_value,
            template_fields(id, field_name, field_label, field_type, is_required)
          ),
          customer_equipment(
            id,
            equipment_type,
            brand,
            model,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedCustomers: Customer[] = data.map(item => {
          const activeTickets = generateSampleTickets(item.id);
          
          // Extract custom data and template information
          const customData = item.customer_custom_data || [];
          const appliedTemplates = item.customer_templates || [];
          const equipment = item.customer_equipment || [];
          
          return {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            status: item.status as CustomerStatus,
            notes: item.notes || '',
            address: item.address || '',
            contact_person: item.contact_person || '',
            company_address: item.company_address || '',
            reason: item.reason || '',
            source: item.source || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            activeTickets,
            ticketCount: activeTickets.length,
            lastTicketDate: activeTickets.length > 0 ? activeTickets[0].createdAt : undefined,
            // Include template and custom data for performance
            _customData: customData,
            _appliedTemplates: appliedTemplates,
            _equipment: equipment,
          };
        });
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      setError('Failed to load customers');
      
      // Fallback to basic query if complex query fails
      try {
        const { data: basicData, error: basicError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (basicError) throw basicError;

        if (basicData) {
          const formattedCustomers: Customer[] = basicData.map(item => {
            const activeTickets = generateSampleTickets(item.id);
            return {
              id: item.id,
              name: item.name,
              email: item.email,
              phone: item.phone || '',
              status: item.status as CustomerStatus,
              notes: item.notes || '',
              address: item.address || '',
              contact_person: item.contact_person || '',
              company_address: item.company_address || '',
              reason: item.reason || '',
              source: item.source || '',
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at),
              activeTickets,
              ticketCount: activeTickets.length,
              lastTicketDate: activeTickets.length > 0 ? activeTickets[0].createdAt : undefined,
            };
          });
          setCustomers(formattedCustomers);
        }
      } catch (fallbackError: any) {
        console.error('Fallback query also failed:', fallbackError.message);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, setCustomers, setLoading, setError, generateSampleTickets]);

  // Effect for initial data load
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
    // Clear data on logout
    if (!user) {
      setCustomers([]);
    }
  }, [user, fetchCustomers, setCustomers]);

  // Effect for real-time updates
  useEffect(() => {
    if (!user) return;

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
        () => {
          toast({ description: "Customer data updated in real-time." });
          fetchCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchCustomers]);

  return { customers, isLoading, fetchCustomers };
};
