
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  company_address?: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
  notes?: string;
  created_at: string;
  updated_at: string;
  createdAt: Date;
  updatedAt: Date;
  ticketCount?: number;
  activeTickets?: any[];
  lastTicketDate?: Date;
  equipment?: any[];
  user_id: string;
}

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

interface CRMContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateCustomerStatus: (customerId: string, status: CustomerStatus) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  updateCustomer: (customerId: string, data: Partial<Customer>) => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  createTicket: (ticketData: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
  addTimeEntry: (timeEntryData: any) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const useCRMContext = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRMContext must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedCustomers: Customer[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        address: item.address || '',
        contact_person: item.contact_person || '',
        company_address: item.company_address || '',
        status: item.status as CustomerStatus,
        notes: item.notes || '',
        created_at: item.created_at,
        updated_at: item.updated_at,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        ticketCount: 0,
        activeTickets: [],
        equipment: [],
        user_id: item.user_id
      }));

      setCustomers(formattedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId: string, status: CustomerStatus) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status })
        .eq('id', customerId);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Error updating customer status:', err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customerId: string, data: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', customerId);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          user_id: user.user.id
        });

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const createTicket = async (ticketData: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          user_id: user.user.id,
          ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating ticket:', err);
      throw err;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      throw err;
    }
  };

  const addTimeEntry = async (timeEntryData: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No authenticated user');

      // This would typically go to a time_entries table
      console.log('Adding time entry:', timeEntryData);
    } catch (err) {
      console.error('Error adding time entry:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const refetch = () => {
    fetchCustomers();
  };

  const value = {
    customers,
    loading,
    error,
    refetch,
    updateCustomerStatus,
    deleteCustomer,
    updateCustomer,
    addCustomer,
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
