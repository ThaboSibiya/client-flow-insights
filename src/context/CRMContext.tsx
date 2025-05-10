
import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { 
  addCustomer as addCustomerService,
  updateCustomerStatus as updateCustomerStatusService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService
} from '@/services/customerService';
import { useAuth } from './AuthContext';
import { Customer, CustomerStatus, CRMContextType } from '@/types/customer';

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const { customers, setCustomers } = useCustomerData();
  const { user } = useAuth();

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newCustomer = await addCustomerService(customerData, user.id);
    if (newCustomer) {
      setCustomers(prev => [newCustomer, ...prev]);
    }
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    if (!user) return;
    
    await updateCustomerStatusService(id, status, user.id);
    // Actual state update will happen via realtime subscription
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    if (!user) return;
    
    await updateCustomerService(id, customerData, user.id);
    // Actual state update will happen via realtime subscription
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    
    await deleteCustomerService(id, user.id);
    // Actual state update will happen via realtime subscription
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

// Re-export types for easier imports elsewhere
export type { Customer, CustomerStatus };
