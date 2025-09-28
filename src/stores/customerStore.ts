
import { create } from 'zustand';
import { Customer, CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  optimisticUpdates: Record<string, Partial<Customer>>;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic updates
  optimisticUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  optimisticDeleteCustomer: (id: string) => void;
  optimisticAddCustomer: (customer: Customer) => void;
  
  // Revert optimistic updates
  revertOptimisticUpdate: (id: string) => void;
  clearOptimisticUpdates: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,
  optimisticUpdates: {},

  setCustomers: (customers) => set({ customers }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  optimisticUpdateCustomer: (id, updates) => {
    const { customers, optimisticUpdates } = get();
    
    // Store the optimistic update
    set({
      optimisticUpdates: {
        ...optimisticUpdates,
        [id]: { ...optimisticUpdates[id], ...updates }
      },
      customers: customers.map(customer =>
        customer.id === id ? { ...customer, ...updates } : customer
      )
    });
  },

  optimisticDeleteCustomer: (id) => {
    const { customers } = get();
    const customerToDelete = customers.find(c => c.id === id);
    
    if (customerToDelete) {
      set({
        customers: customers.filter(c => c.id !== id),
        optimisticUpdates: {
          ...get().optimisticUpdates,
          [id]: { ...customerToDelete, __deleted: true } as Partial<Customer> & { __deleted: true }
        }
      });
    }
  },

  optimisticAddCustomer: (customer) => {
    const { customers } = get();
    set({
      customers: [customer, ...customers],
      optimisticUpdates: {
        ...get().optimisticUpdates,
        [customer.id]: { __added: true } as Partial<Customer> & { __added: true }
      }
    });
  },

  revertOptimisticUpdate: (id) => {
    const { optimisticUpdates } = get();
    const update = optimisticUpdates[id];
    
    if (update) {
      const newOptimisticUpdates = { ...optimisticUpdates };
      delete newOptimisticUpdates[id];
      
      set({ optimisticUpdates: newOptimisticUpdates });
      
      // If it was a delete operation, restore the customer
      if ('__deleted' in update && update.__deleted) {
        const { customers } = get();
        set({ customers: [update as Customer, ...customers] });
      }
      
      // If it was an add operation, remove the customer
      if ('__added' in update && update.__added) {
        const { customers } = get();
        set({ customers: customers.filter(c => c.id !== id) });
      }
      
      toast({
        title: "Action reverted",
        description: "The previous action has been undone due to an error",
        variant: "destructive",
      });
    }
  },

  clearOptimisticUpdates: () => set({ optimisticUpdates: {} }),
}));
