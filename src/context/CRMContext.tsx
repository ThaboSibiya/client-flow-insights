
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

// Generate a random ID for new customers
const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample data for demo purposes
const initialCustomers: Customer[] = [
  {
    id: generateId(),
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'new',
    notes: 'Initial contact made via website',
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-01'),
  },
  {
    id: generateId(),
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '(555) 987-6543',
    status: 'existing',
    notes: 'Looking for updated policy options',
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-05-02'),
  },
  {
    id: generateId(),
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '(555) 456-7890',
    status: 'pending',
    notes: 'Reviewing policy proposal',
    createdAt: new Date('2025-04-28'),
    updatedAt: new Date('2025-05-03'),
  },
  {
    id: generateId(),
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    phone: '(555) 333-2222',
    status: 'finalised',
    notes: 'Policy #A-12345 issued',
    createdAt: new Date('2025-04-10'),
    updatedAt: new Date('2025-05-01'),
  },
];

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomerStatus = (id: string, status: CustomerStatus) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === id
          ? { ...customer, status, updatedAt: new Date() }
          : customer
      )
    );
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === id
          ? { ...customer, ...customerData, updatedAt: new Date() }
          : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
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
