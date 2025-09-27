import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerStore } from '@/stores/customerStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
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
  useCustomerData(); // This hook now manages data fetching and updates the customer store.
  const customerStore = useCustomerStore();
  const ticketStore = useTicketStore();
  const { updateCustomerOptimistically, deleteCustomerOptimistically, addCustomerOptimistically, updateTicketOptimistically } = useOptimisticUpdates();
  const { user } = useAuth();

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => {
    if (!user) return;
    
    try {
      // Add customer to database first
      const actualCustomer = await addCustomerService({
        ...customerData,
        activeTickets: [],
        ticketCount: 0
      }, user.id);
      
      if (actualCustomer) {
        // Immediately update the store with the new customer
        const currentCustomers = customerStore.customers;
        customerStore.setCustomers([actualCustomer, ...currentCustomers]);
        
        // Clear any error state
        customerStore.setError(null);
        
        return actualCustomer;
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      customerStore.setError('Failed to add customer');
      throw error;
    }
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    if (!user) return;
    
    await updateCustomerOptimistically(id, { status }, async () => {
      await updateCustomerStatusService(id, status, user.id);
    });
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    if (!user) return;
    
    await updateCustomerOptimistically(id, customerData, async () => {
      await updateCustomerService(id, customerData, user.id);
    });
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    
    await deleteCustomerOptimistically(id, async () => {
      await deleteCustomerService(id, user.id);
    });
  };

  const createTicket = async (customerId: string, ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
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

    // Apply optimistic update to both stores
    ticketStore.optimisticAddTicket(customerId, newTicket);
    customerStore.optimisticUpdateCustomer(customerId, {
      activeTickets: [...(customerStore.customers.find(c => c.id === customerId)?.activeTickets || []), newTicket],
      ticketCount: (customerStore.customers.find(c => c.id === customerId)?.ticketCount || 0) + 1,
      lastTicketDate: new Date()
    });

    // Note: In a real app, you'd make a server call here
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    if (!user) return;
    
    await updateTicketOptimistically(ticketId, { status, updatedAt: new Date() }, async () => {
      // Note: In a real app, you'd make a server call here
      console.log(`Updating ticket ${ticketId} status to ${status}`);
    });

    // Also update in customer store
    customerStore.setCustomers(
      customerStore.customers.map(customer => ({
        ...customer,
        activeTickets: (customer.activeTickets || []).map(ticket =>
          ticket.id === ticketId 
            ? { ...ticket, status, updatedAt: new Date() }
            : ticket
        )
      }))
    );
  };

  const addTimeEntry = async (ticketId: string, timeEntryData: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>) => {
    if (!user) return;

    const newTimeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      ticketId,
      ...timeEntryData,
      createdAt: new Date(),
    };

    const updates = {
      timeEntries: [...(customerStore.customers
        .flatMap(c => c.activeTickets || [])
        .find(t => t.id === ticketId)?.timeEntries || []), newTimeEntry],
      totalTimeSpent: (customerStore.customers
        .flatMap(c => c.activeTickets || [])
        .find(t => t.id === ticketId)?.totalTimeSpent || 0) + newTimeEntry.duration,
      updatedAt: new Date()
    };

    await updateTicketOptimistically(ticketId, updates, async () => {
      // Note: In a real app, you'd make a server call here
      console.log(`Adding time entry to ticket ${ticketId}`);
    });

    // Also update in customer store
    customerStore.setCustomers(
      customerStore.customers.map(customer => ({
        ...customer,
        activeTickets: (customer.activeTickets || []).map(ticket =>
          ticket.id === ticketId 
            ? { ...ticket, ...updates }
            : ticket
        )
      }))
    );
  };

  return (
    <CRMContext.Provider
      value={{
        customers: customerStore.customers,
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
