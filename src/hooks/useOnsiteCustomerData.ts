
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/components/customers/onsite/types';
import { CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { logSecurityEvent, validateEmail, validatePhone, sanitizeInput } from '@/services/securityService';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export const useOnsiteCustomerData = (isOpen: boolean) => {
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

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Authentication required");
        await logSecurityEvent({
          action: 'unauthorized_customer_access',
          resource_type: 'customers',
          success: false,
          error_message: 'No authenticated user'
        });
        return;
      }

      await logSecurityEvent({
        action: 'customer_data_access',
        resource_type: 'customers',
        success: true
      });

      console.log('Current user:', user.id);

      // Try to get the employee record with better error handling
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let companyOwnerId = user.id; // Default to current user

      if (employeeError) {
        console.warn('Employee lookup error:', employeeError);
        await logSecurityEvent({
          action: 'employee_lookup_failed',
          resource_type: 'employees',
          success: false,
          error_message: employeeError.message
        });
        
        // Don't proceed if we can't determine company ownership securely
        setError("Unable to verify company access permissions");
        return;
      } else if (employee) {
        companyOwnerId = employee.company_owner_id;
        console.log('Found employee record, company owner:', companyOwnerId);
      } else {
        console.log('No employee record found, using current user as company owner');
        await logSecurityEvent({
          action: 'company_owner_defaulted',
          resource_type: 'employees',
          success: true
        });
      }

      // Get customers with proper RLS enforcement + explicit workspace scope
      let customersQuery = supabase
        .from('customers')
        .select('id, name, email, phone, status, notes, user_id, workspace_id')
        .eq('user_id', companyOwnerId);

      if (workspaceId) {
        customersQuery = customersQuery.eq('workspace_id', workspaceId);
      }

      const { data, error } = await customersQuery.order('name');

      if (error) {
        await logSecurityEvent({
          action: 'customer_fetch_failed',
          resource_type: 'customers',
          success: false,
          error_message: error.message
        });
        throw error;
      }

      const formattedCustomers: Customer[] = (data || []).map(item => ({
        id: item.id,
        name: sanitizeInput(item.name, 100),
        email: item.email,
        phone: item.phone || '',
        status: item.status as CustomerStatus,
        notes: sanitizeInput(item.notes || '', 500)
      }));

      console.log('Loaded customers:', formattedCustomers.length);
      setCustomers(formattedCustomers);

      if (formattedCustomers.length === 0) {
        setError("No customers found. Please add customers first.");
      }

    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError(`Failed to load customers: ${error.message}`);
      await logSecurityEvent({
        action: 'customer_load_error',
        resource_type: 'customers',
        success: false,
        error_message: error.message
      });
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerTickets = async (customerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await logSecurityEvent({
          action: 'unauthorized_ticket_access',
          resource_type: 'tickets',
          resource_id: customerId,
          success: false
        });
        return [];
      }

      // Verify customer ownership before loading tickets
      const { data: customer } = await supabase
        .from('customers')
        .select('user_id')
        .eq('id', customerId)
        .single();

      if (!customer || customer.user_id !== user.id) {
        await logSecurityEvent({
          action: 'unauthorized_customer_ticket_access',
          resource_type: 'tickets',
          resource_id: customerId,
          success: false,
          error_message: 'Customer ownership verification failed'
        });
        return [];
      }

      let ticketsQuery = supabase
        .from('tickets')
        .select('id, ticket_number, subject, status, priority, created_at')
        .eq('user_id', user.id)
        .eq('customer_id', customerId)
        .in('status', ['open', 'in-progress']);

      if (workspaceId) {
        ticketsQuery = ticketsQuery.eq('workspace_id', workspaceId);
      }

      const { data, error } = await ticketsQuery.order('created_at', { ascending: false });

      if (error) {
        await logSecurityEvent({
          action: 'ticket_fetch_failed',
          resource_type: 'tickets',
          resource_id: customerId,
          success: false,
          error_message: error.message
        });
        throw error;
      }

      await logSecurityEvent({
        action: 'customer_tickets_accessed',
        resource_type: 'tickets',
        resource_id: customerId,
        success: true
      });

      return (data || []).map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subject: sanitizeInput(ticket.subject, 200),
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at
      }));
    } catch (error) {
      console.error('Error loading customer tickets:', error);
      await logSecurityEvent({
        action: 'ticket_load_error',
        resource_type: 'tickets',
        resource_id: customerId,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  };

  return {
    customers,
    loading,
    error,
    loadCustomerTickets
  };
};
