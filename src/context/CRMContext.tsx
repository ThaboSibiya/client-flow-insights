
import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { 
  addCustomer as addCustomerService,
  updateCustomerStatus as updateCustomerStatusService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService
} from '@/services/customerService';
import { useAuth } from './AuthContext';
import { Customer, CustomerStatus, CustomerTicket, TicketStatus, CRMContextType, TimeEntry } from '@/types/customer';

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const { customers, setCustomers } = useCustomerData();
  const { user } = useAuth();

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => {
    if (!user) return;
    
    const newCustomer = await addCustomerService({
      ...customerData,
      activeTickets: [],
      ticketCount: 0
    }, user.id);
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

  const createTicket = async (customerId: string, ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    
    const newTicket: CustomerTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber,
      ...ticketData,
      timeEntries: [],
      totalTimeSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update customer with new ticket
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? {
            ...customer,
            activeTickets: [...(customer.activeTickets || []), newTicket],
            ticketCount: (customer.ticketCount || 0) + 1,
            lastTicketDate: new Date()
          }
        : customer
    ));
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    if (!user) return;
    
    setCustomers(prev => prev.map(customer => ({
      ...customer,
      activeTickets: (customer.activeTickets || []).map(ticket =>
        ticket.id === ticketId 
          ? { ...ticket, status, updatedAt: new Date() }
          : ticket
      )
    })));
  };

  const addTimeEntry = async (ticketId: string, timeEntryData: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>) => {
    if (!user) return;

    const newTimeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      ticketId,
      ...timeEntryData,
      createdAt: new Date(),
    };

    setCustomers(prev => prev.map(customer => ({
      ...customer,
      activeTickets: (customer.activeTickets || []).map(ticket =>
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              timeEntries: [...(ticket.timeEntries || []), newTimeEntry],
              totalTimeSpent: (ticket.totalTimeSpent || 0) + newTimeEntry.duration,
              updatedAt: new Date()
            }
          : ticket
      )
    })));
  };

  return (
    <CRMContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomerStatus,
        updateCustomer,
        deleteCustomer,
        createTicket,
        updateTicketStatus,
        addTimeEntry,
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
export type { Customer, CustomerStatus, CustomerTicket, TicketStatus };
