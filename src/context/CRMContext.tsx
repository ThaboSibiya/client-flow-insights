
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CRMContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

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
      
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [data, ...prev]);
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
      
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? { ...customer, ...data } : customer
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
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

export default CRMContext;
