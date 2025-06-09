
import { describe, it, expect, beforeEach } from 'vitest';
import { useCustomerStore } from '@/stores/customerStore';
import { Customer } from '@/types/customer';

describe('Customer Store', () => {
  const mockCustomer: Customer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    status: 'new',
    notes: 'Test customer',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    activeTickets: [],
    ticketCount: 0,
  };

  beforeEach(() => {
    // Reset store state before each test
    useCustomerStore.setState({
      customers: [],
      isLoading: false,
      error: null,
      optimisticUpdates: {},
    });
  });

  it('should set customers', () => {
    const store = useCustomerStore.getState();
    store.setCustomers([mockCustomer]);

    expect(useCustomerStore.getState().customers).toEqual([mockCustomer]);
  });

  it('should handle optimistic updates', () => {
    const store = useCustomerStore.getState();
    store.setCustomers([mockCustomer]);
    
    store.optimisticUpdateCustomer('1', { name: 'Updated Name' });

    const updatedCustomers = useCustomerStore.getState().customers;
    expect(updatedCustomers[0].name).toBe('Updated Name');
    
    const optimisticUpdates = useCustomerStore.getState().optimisticUpdates;
    expect(optimisticUpdates['1']).toEqual({ name: 'Updated Name' });
  });

  it('should handle optimistic delete', () => {
    const store = useCustomerStore.getState();
    store.setCustomers([mockCustomer]);
    
    store.optimisticDeleteCustomer('1');

    const customers = useCustomerStore.getState().customers;
    expect(customers).toHaveLength(0);
    
    const optimisticUpdates = useCustomerStore.getState().optimisticUpdates;
    expect(optimisticUpdates['1']).toBeDefined();
  });

  it('should revert optimistic updates', () => {
    const store = useCustomerStore.getState();
    store.setCustomers([mockCustomer]);
    
    // Make an optimistic update
    store.optimisticUpdateCustomer('1', { name: 'Updated Name' });
    
    // Revert the update
    store.revertOptimisticUpdate('1');

    const optimisticUpdates = useCustomerStore.getState().optimisticUpdates;
    expect(optimisticUpdates['1']).toBeUndefined();
  });

  it('should clear all optimistic updates', () => {
    const store = useCustomerStore.getState();
    store.optimisticUpdateCustomer('1', { name: 'Updated' });
    store.optimisticUpdateCustomer('2', { name: 'Another Update' });
    
    store.clearOptimisticUpdates();

    const optimisticUpdates = useCustomerStore.getState().optimisticUpdates;
    expect(Object.keys(optimisticUpdates)).toHaveLength(0);
  });
});
