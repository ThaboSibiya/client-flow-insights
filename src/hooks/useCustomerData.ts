import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus, CustomerTicket, TimeEntry, CustomerEquipment } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useCustomerStore } from '@/stores/customerStore';

export const useCustomerData = () => {
  const { user } = useAuth();
  const { customers, setCustomers, setLoading, setError, isLoading } = useCustomerStore();
  
  const isInitializedRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  const generateSampleTickets = useCallback((customerId: string): CustomerTicket[] => {
    const sampleTimeEntries: TimeEntry[] = [
      {
        id: 'time-1',
        ticketId: `ticket-${customerId}-1`,
        employeeId: 'user-1',
        userId: 'user-1',
        userName: 'John Doe',
        description: 'Initial investigation',
        hours: 1,
        duration: 45,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'time-2',
        ticketId: `ticket-${customerId}-1`,
        employeeId: 'user-2',
        userId: 'user-2',
        userName: 'Jane Smith',
        description: 'Customer follow-up',
        hours: 1,
        duration: 30,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    ];

    const sampleTickets: CustomerTicket[] = [
      {
        id: `ticket-${customerId}-1`,
        ticketNumber: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customerId,
        status: 'open',
        priority: 'high',
        subject: 'Equipment setup and configuration',
        description: 'Customer needs help with equipment setup',
        timeEntries: sampleTimeEntries,
        totalTimeSpent: 75,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: `ticket-${customerId}-2`,
        ticketNumber: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customerId,
        status: 'resolved',
        priority: 'medium',
        subject: 'Documentation request',
        description: 'Customer requested product documentation',
        timeEntries: [],
        totalTimeSpent: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    ];
    
    return Math.random() > 0.6 ? sampleTickets : [];
  }, []);

  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('No user, clearing customers');
      setCustomers([]);
      return;
    }

    if (!forceRefresh && customers.length > 0 && !isLoading && isInitializedRef.current) {
      console.log('Skipping fetch - already have data');
      return;
    }

    console.log('Fetching customers for user:', user.id, 'forceRefresh:', forceRefresh);
    setLoading(true);
    setError(null);

    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_equipment (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      console.log('Raw customer data from database:', customersData?.length || 0, 'customers');

      if (customersData) {
        const formattedCustomers: Customer[] = customersData.map(item => {
          const activeTickets = generateSampleTickets(item.id);
          
          const equipment: CustomerEquipment[] = (item.customer_equipment || []).map((eq: any) => ({
            id: eq.id,
            customer_id: eq.customer_id,
            user_id: eq.user_id,
            equipment_type: eq.equipment_type,
            brand: eq.brand || '',
            model: eq.model || '',
            serial_number: eq.serial_number || '',
            purchase_date: eq.purchase_date ? new Date(eq.purchase_date) : undefined,
            warranty_expiry: eq.warranty_expiry ? new Date(eq.warranty_expiry) : undefined,
            notes: eq.notes || '',
            created_at: new Date(eq.created_at),
            updated_at: new Date(eq.updated_at),
          }));

          const customer: Customer = {
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            address: item.address || '',
            contact_person: item.contact_person || '',
            company_address: item.company_address || '',
            status: item.status as CustomerStatus,
            notes: item.notes || '',
            equipment,
            created_at: item.created_at,
            updated_at: item.updated_at,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            activeTickets,
            ticketCount: activeTickets.length,
            lastTicketDate: activeTickets.length > 0 ? activeTickets[0].createdAt : undefined,
          };
          return customer;
        });
        
        console.log('Setting formatted customers:', formattedCustomers.length);
        setCustomers(formattedCustomers);
        isInitializedRef.current = true;
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
  }, [user?.id, setCustomers, setLoading, setError, generateSampleTickets]);

  useEffect(() => {
    if (user && !isInitializedRef.current) {
      console.log('Initial customer data load for user:', user.id);
      fetchCustomers();
    }
    
    if (!user) {
      console.log('Clearing customer data due to logout');
      setCustomers([]);
      isInitializedRef.current = false;
    }
  }, [user?.id, fetchCustomers, setCustomers]);

  useEffect(() => {
    if (!user || !isInitializedRef.current) return;

    if (subscriptionRef.current) {
      console.log('Cleaning up existing real-time subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('Setting up real-time subscription for customers');
    
    const subscription = supabase
      .channel('customers-realtime-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time customer update received:', payload.eventType);
          toast({ 
            description: "Customer data updated in real-time.",
            duration: 3000 
          });
          fetchCustomers(true);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, fetchCustomers]);

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
