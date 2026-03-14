
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useCustomerStore } from '@/stores/customerStore';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export const useCustomerData = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const { customers, setCustomers, setLoading, setError, isLoading } = useCustomerStore();

  const fetchCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch customers with related data in one query
      let query = supabase
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
          ),
          tickets(
            id,
            ticket_number,
            status,
            priority,
            subject,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedCustomers: Customer[] = data.map(item => {
          const customData = item.customer_custom_data || [];
          const appliedTemplates = item.customer_templates || [];
          const equipment = item.customer_equipment || [];
          const tickets = (item as any).tickets || [];

          // Map real tickets to CustomerTicket shape
          const activeTickets = tickets.map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticket_number,
            status: t.status,
            priority: t.priority,
            subject: t.subject,
            timeEntries: [],
            totalTimeSpent: 0,
            createdAt: new Date(t.created_at),
            updatedAt: new Date(t.updated_at),
          }));

          const openTicketStatuses = ['open', 'in-progress', 'in_progress'];
          const lastTicket = activeTickets.length > 0
            ? activeTickets.reduce((latest: any, t: any) => t.createdAt > latest.createdAt ? t : latest, activeTickets[0])
            : undefined;

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
            lastTicketDate: lastTicket?.createdAt,
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
        let fallbackQuery = supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);

        if (workspaceId) {
          fallbackQuery = fallbackQuery.eq('workspace_id', workspaceId);
        }

        const { data: basicData, error: basicError } = await fallbackQuery
          .order('created_at', { ascending: false });

        if (basicError) throw basicError;

        if (basicData) {
          const formattedCustomers: Customer[] = basicData.map(item => ({
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
          }));
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
  }, [user, setCustomers, setLoading, setError]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
    if (!user) {
      setCustomers([]);
    }
  }, [user, fetchCustomers, setCustomers]);

  // Real-time updates
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
