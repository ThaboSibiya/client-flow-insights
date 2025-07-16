
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface CRMContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  refreshCustomers: () => void;
  loading: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedCustomers: Customer[] = data.map((customer) => ({
        ...customer,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
        activeTickets: [],
        ticketCount: 0,
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newCustomer: Customer = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        activeTickets: [],
        ticketCount: 0,
      };

      setCustomers(prev => [newCustomer, ...prev]);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCustomer: Customer = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        activeTickets: [],
        ticketCount: 0,
      };

      setCustomers(prev => prev.map(customer => 
        customer.id === id ? updatedCustomer : customer
      ));
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const refreshCustomers = () => {
    fetchCustomers();
  };

  return (
    <CRMContext.Provider value={{
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      refreshCustomers,
      loading,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export { Customer, CustomerStatus };
