
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Customer, CustomerStatus, CustomerTicket, TimeEntry } from '@/types/customer';

export type { Customer, CustomerStatus, CustomerTicket, TimeEntry };

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

interface CRMContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  updateCustomerStatus: (id: string, status: CustomerStatus) => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRMContext = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRMContext must be used within a CRMProvider');
  }
  return context;
};

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
      
      const transformedCustomers: Customer[] = (data || []).map(customer => ({
        ...customer,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
        status: customer.status as CustomerStatus,
        activeTickets: [],
        ticketCount: 0
      }));
      
      setCustomers(transformedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'>) => {
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
        updatedAt: new Date(data.updated_at),
        status: data.status as CustomerStatus,
        activeTickets: [],
        ticketCount: 0
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
        updatedAt: new Date(data.updated_at),
        status: data.status as CustomerStatus,
        activeTickets: [],
        ticketCount: 0
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
    console.log('Creating ticket:', ticket);
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    console.log('Updating ticket status:', ticketId, status);
  };

  const addTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
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
