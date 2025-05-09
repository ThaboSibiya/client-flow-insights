
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CRMContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { user } = useAuth();

  // Fetch customers data from Supabase
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      return;
    }

    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data from Supabase format to our Customer format
          const formattedCustomers: Customer[] = data.map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            status: item.status as CustomerStatus,
            notes: item.notes || '',
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          }));
          
          setCustomers(formattedCustomers);
        }
      } catch (error: any) {
        console.error('Error fetching customers:', error.message);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      }
    };

    fetchCustomers();

    // Set up realtime subscription
    const subscription = supabase
      .channel('customers-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh data when changes occur
          fetchCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add customers",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Adding customer with data:", { ...customerData, user_id: user.id });
      
      const { data, error } = await supabase
        .from('customers')
        .insert([
          { 
            ...customerData,
            user_id: user.id
          }
        ])
        .select('*')
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (data) {
        console.log("Customer added successfully:", data);
        
        const newCustomer: Customer = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          status: data.status as CustomerStatus,
          notes: data.notes || '',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        
        setCustomers(prev => [newCustomer, ...prev]);
        
        toast({
          title: "Success",
          description: "Customer added successfully",
        });
      }
    } catch (error: any) {
      console.error('Error adding customer:', error.message);
      toast({
        title: "Error",
        description: `Failed to add customer: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update will be received through realtime subscription
      toast({
        title: "Success",
        description: "Customer status updated",
      });
    } catch (error: any) {
      console.error('Error updating customer status:', error.message);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    if (!user) return;
    
    try {
      // Transform to database format
      const dbData: any = { ...customerData, updated_at: new Date().toISOString() };
      
      // Remove fields that shouldn't be sent to the database
      if (dbData.createdAt) delete dbData.createdAt;
      if (dbData.updatedAt) delete dbData.updatedAt;
      
      const { error } = await supabase
        .from('customers')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update will be received through realtime subscription
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating customer:', error.message);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update will be received through realtime subscription
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  return (
    <CRMContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomerStatus,
        updateCustomer,
        deleteCustomer,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
