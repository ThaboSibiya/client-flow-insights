import { useEffect } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to handle customer data refresh triggers
 * Ensures the customer table updates immediately when new customers are added
 */
export const useCustomerRefresh = () => {
  const { user } = useAuth();
  const { setCustomers } = useCustomerStore();

  // Listen for customer creation events across the app
  useEffect(() => {
    const handleCustomerCreated = (event: CustomEvent) => {
      const newCustomer = event.detail;
      if (newCustomer && user) {
        // Get current store state
        const currentCustomers = useCustomerStore.getState().customers;
        
        // Check if customer already exists (avoid duplicates)
        const exists = currentCustomers.some(c => c.id === newCustomer.id);
        if (!exists) {
          // Add the new customer to the top of the list
          setCustomers([newCustomer, ...currentCustomers]);
        }
      }
    };

    // Listen for custom events
    window.addEventListener('customerCreated', handleCustomerCreated as EventListener);

    return () => {
      window.removeEventListener('customerCreated', handleCustomerCreated as EventListener);
    };
  }, [user, setCustomers]);
};

/**
 * Function to trigger customer refresh event
 * Call this after successfully creating a customer
 */
export const triggerCustomerRefresh = (customer: any) => {
  const event = new CustomEvent('customerCreated', { detail: customer });
  window.dispatchEvent(event);
};