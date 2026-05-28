
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus, CustomerTicket } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useCustomerStore } from '@/stores/customerStore';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

const CUSTOMER_COLUMNS =
  'id, name, email, phone, status, notes, address, contact_person, company_address, reason, source, created_at, updated_at, workspace_id';

export const useCustomerData = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const { customers, setCustomers, setLoading, setError, isLoading } = useCustomerStore();
  const customersRef = useRef(customers);
  customersRef.current = customers;

  const hydrateTickets = useCallback(async (customerIds: string[]) => {
    if (!user || customerIds.length === 0) return;

    const { data, error } = await supabase
      .from('tickets')
      .select('id, customer_id, ticket_number, status, priority, subject, created_at, updated_at')
      .eq('user_id', user.id)
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.warn('Ticket hydration skipped:', error.message);
      return;
    }

    const ticketsByCustomer = new Map<string, CustomerTicket[]>();
    (data ?? []).forEach((ticket: any) => {
      const formattedTicket: CustomerTicket = {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        status: ticket.status,
        priority: ticket.priority,
        subject: ticket.subject,
        timeEntries: [],
        totalTimeSpent: 0,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
      };
      const existing = ticketsByCustomer.get(ticket.customer_id) ?? [];
      ticketsByCustomer.set(ticket.customer_id, [...existing, formattedTicket]);
    });

    setCustomers(customersRef.current.map(customer => {
      const activeTickets = ticketsByCustomer.get(customer.id) ?? [];
      const lastTicket = activeTickets[0];
      return {
        ...customer,
        activeTickets,
        ticketCount: activeTickets.length,
        lastTicketDate: lastTicket?.createdAt,
      };
    }));
  }, [user, setCustomers]);

  const fetchCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('customers')
        .select(CUSTOMER_COLUMNS)
        .eq('user_id', user.id);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(500);


      if (error) throw error;

      if (data) {
        const formattedCustomers: Customer[] = data.map(item => {
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
            activeTickets: [],
            ticketCount: 0,
            lastTicketDate: undefined,
          };
        });
        setCustomers(formattedCustomers);
        void hydrateTickets(formattedCustomers.map(customer => customer.id));
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
  }, [user, workspaceId, setCustomers, setLoading, setError, hydrateTickets]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
    if (!user) {
      setCustomers([]);
    }
  }, [user, fetchCustomers, setCustomers]);

  // Real-time updates — targeted mutations instead of full refetch
  useEffect(() => {
    if (!user) return;

    const applyRow = (row: any): Customer => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      status: row.status as CustomerStatus,
      notes: row.notes || '',
      address: row.address || '',
      contact_person: row.contact_person || '',
      company_address: row.company_address || '',
      reason: row.reason || '',
      source: row.source || '',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      activeTickets: [],
      ticketCount: 0,
      lastTicketDate: undefined,
    });

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
        (payload: any) => {
          // Workspace scope guard
          const row = payload.new ?? payload.old;
          if (workspaceId && row?.workspace_id && row.workspace_id !== workspaceId) return;

          const current = customersRef.current;
          if (payload.eventType === 'INSERT') {
            if (current.some(c => c.id === payload.new.id)) return;
            // Merge — preserve existing ticket data if hydrated
            setCustomers([applyRow(payload.new), ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(
              current.map(c =>
                c.id === payload.new.id
                  ? { ...c, ...applyRow(payload.new), activeTickets: c.activeTickets, ticketCount: c.ticketCount, lastTicketDate: c.lastTicketDate }
                  : c,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setCustomers(current.filter(c => c.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, workspaceId, setCustomers]);

  return { customers, isLoading, fetchCustomers };
};
