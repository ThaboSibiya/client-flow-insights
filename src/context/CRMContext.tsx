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
import {
  createTicket as createTicketService,
  updateTicketStatus as updateTicketStatusService,
  updateTicket as updateTicketService
} from '@/services/ticketService';
import { useAuth } from './AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { Customer, CustomerStatus, CustomerTicket, TicketStatus, CRMContextType, TimeEntry } from '@/types/customer';

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const { fetchCustomers } = useCustomerData(); // This hook now manages data fetching and updates the customer store.
  const customerStore = useCustomerStore();
  const ticketStore = useTicketStore();
  const { updateCustomerOptimistically, deleteCustomerOptimistically, updateTicketOptimistically } = useOptimisticUpdates();
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => {
    if (!user) return;
    
    try {
      // Add customer to database first
      const actualCustomer = await addCustomerService({
        ...customerData,
        activeTickets: [],
        ticketCount: 0
      }, user.id, workspaceId);
      
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
    
    try {
      // Create ticket in Supabase
      const actualTicket = await createTicketService(customerId, ticketData, user.id, workspaceId);
      
      if (actualTicket) {
        // Update stores with the actual ticket from Supabase
        ticketStore.optimisticAddTicket(customerId, actualTicket);
        customerStore.optimisticUpdateCustomer(customerId, {
          activeTickets: [...(customerStore.customers.find(c => c.id === customerId)?.activeTickets || []), actualTicket],
          ticketCount: (customerStore.customers.find(c => c.id === customerId)?.ticketCount || 0) + 1,
          lastTicketDate: new Date()
        });

        return actualTicket;
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      throw error;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    if (!user) return;
    
    await updateTicketOptimistically(ticketId, { status, updatedAt: new Date() }, async () => {
      // Save to Supabase
      await updateTicketStatusService(ticketId, status, user.id);
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
