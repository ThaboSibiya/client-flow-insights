
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  createdAt: Date;
  contact_person?: string;
  company_address?: string;
  equipment?: Array<{
    id: string;
    equipment_type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
  }>;
  activeTickets?: Array<any>;
  ticketCount?: number;
  lastTicketDate?: Date;
}

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  ticketId: string;
  description: string;
  hours: number;
  date: Date;
  employeeId: string;
}

interface CRMContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  updateCustomerStatus: (id: string, status: CustomerStatus) => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRMContext = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRMContext must be used within a CRMProvider');
  }
  return context;
};

// Export useCRM as an alias for useCRMContext for compatibility
export const useCRM = useCRMContext;

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshCustomers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our Customer interface
      const transformedCustomers: Customer[] = (data || []).map(customer => ({
        ...customer,
        createdAt: new Date(customer.created_at),
        status: customer.status || 'new'
      }));
      
      setCustomers(transformedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedCustomer: Customer = {
        ...data,
        createdAt: new Date(data.created_at),
        status: data.status || 'new'
      };
      
      setCustomers(prev => [transformedCustomer, ...prev]);
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedCustomer: Customer = {
        ...data,
        createdAt: new Date(data.created_at),
        status: data.status || 'new'
      };
      
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? { ...customer, ...transformedCustomer } : customer
      ));
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    await updateCustomer(id, { status });
  };

  const createTicket = async (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Mock implementation - replace with actual Supabase call when tickets table exists
    console.log('Creating ticket:', ticket);
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    // Mock implementation - replace with actual Supabase call when tickets table exists
    console.log('Updating ticket status:', ticketId, status);
  };

  const addTimeEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    // Mock implementation - replace with actual Supabase call when time_entries table exists
    console.log('Adding time entry:', entry);
  };

  useEffect(() => {
    if (user) {
      refreshCustomers();
    }
  }, [user]);

  const value: CRMContextType = {
    customers,
    loading,
    error,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    createTicket,
    updateTicketStatus,
    addTimeEntry,
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

export default CRMContext;
