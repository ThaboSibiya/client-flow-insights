
import { useCallback } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useTicketStore } from '@/stores/ticketStore';
import { Customer, CustomerStatus, CustomerTicket, TicketStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

export const useOptimisticUpdates = () => {
  const customerStore = useCustomerStore();
  const ticketStore = useTicketStore();

  const updateCustomerOptimistically = useCallback(async (
    id: string,
    updates: Partial<Customer>,
    serverAction: () => Promise<void>
  ) => {
    // Apply optimistic update
    customerStore.optimisticUpdateCustomer(id, updates);

    try {
      // Perform server action
      await serverAction();
      // Clear optimistic update on success
      customerStore.clearOptimisticUpdates();
    } catch (error) {
      // Revert optimistic update on error
      customerStore.revertOptimisticUpdate(id);
      throw error;
    }
  }, [customerStore]);

  const deleteCustomerOptimistically = useCallback(async (
    id: string,
    serverAction: () => Promise<void>
  ) => {
    // Apply optimistic delete
    customerStore.optimisticDeleteCustomer(id);

    try {
      // Perform server action
      await serverAction();
      // Clear optimistic update on success
      customerStore.clearOptimisticUpdates();
    } catch (error) {
      // Revert optimistic delete on error
      customerStore.revertOptimisticUpdate(id);
      throw error;
    }
  }, [customerStore]);

  const addCustomerOptimistically = useCallback(async (
    customer: Customer,
    serverAction: () => Promise<void>
  ) => {
    // Apply optimistic add
    customerStore.optimisticAddCustomer(customer);

    try {
      // Perform server action
      await serverAction();
      // Clear optimistic update on success
      customerStore.clearOptimisticUpdates();
    } catch (error) {
      // Revert optimistic add on error
      customerStore.revertOptimisticUpdate(customer.id);
      throw error;
    }
  }, [customerStore]);

  const updateTicketOptimistically = useCallback(async (
    ticketId: string,
    updates: Partial<CustomerTicket>,
    serverAction: () => Promise<void>
  ) => {
    // Apply optimistic update
    ticketStore.optimisticUpdateTicket(ticketId, updates);

    try {
      // Perform server action
      await serverAction();
      // Clear optimistic update on success
      ticketStore.clearOptimisticUpdates();
    } catch (error) {
      // Revert optimistic update on error
      ticketStore.revertOptimisticTicketUpdate(ticketId);
      throw error;
    }
  }, [ticketStore]);

  return {
    updateCustomerOptimistically,
    deleteCustomerOptimistically,
    addCustomerOptimistically,
    updateTicketOptimistically,
  };
};
