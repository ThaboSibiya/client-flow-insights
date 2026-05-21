import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, OnSiteTicket } from '../types';
import { CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export const useCustomerData = (isOpen: boolean) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workspaceId = useActiveWorkspaceId();

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workspaceId]);

  const resolveCompanyOwnerId = async (userId: string): Promise<string | null> => {
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('company_owner_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (employeeError && employeeError.code !== 'PGRST116') {
      console.error('Employee lookup error:', employeeError);
      return null;
    }

    // Fail closed: only treat the current user as company owner if they actually
    // own customer records. No silent fallback.
    if (employee?.company_owner_id) return employee.company_owner_id;

    const { data: ownedCustomer, error: ownerCheckError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (ownerCheckError) {
      console.error('Owner verification failed:', ownerCheckError);
      return null;
    }

    return ownedCustomer ? userId : null;
  };

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to continue');
        return;
      }

      const companyOwnerId = await resolveCompanyOwnerId(user.id);
      if (!companyOwnerId) {
        setError('Access denied: no company association found for this account.');
        toast({
          title: 'Access denied',
          description: 'Your account is not linked to a company. Contact your administrator.',
          variant: 'destructive',
        });
        return;
      }

      let query = supabase
        .from('customers')
        .select('id, name, email, phone, status, notes')
        .eq('user_id', companyOwnerId);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;

      const formattedCustomers: Customer[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        status: item.status as CustomerStatus,
        notes: item.notes || '',
      }));

      setCustomers(formattedCustomers);
      if (formattedCustomers.length === 0) {
        setError('No customers found. Please add customers first.');
      }
    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError(`Failed to load customers: ${error.message}`);
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerTickets = async (customerId: string): Promise<OnSiteTicket[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const companyOwnerId = await resolveCompanyOwnerId(user.id);
      if (!companyOwnerId) return [];

      let query = supabase
        .from('tickets')
        .select('id, ticket_number, subject, status, priority, created_at')
        .eq('user_id', companyOwnerId)
        .eq('customer_id', customerId)
        .in('status', ['open', 'in-progress']);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).map((ticket) => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
      }));
    } catch (error) {
      console.error('Error loading customer tickets:', error);
      return [];
    }
  };

  return {
    customers,
    loading,
    error,
    loadCustomerTickets,
  };
};
