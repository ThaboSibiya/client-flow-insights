
import { create } from 'zustand';
import { Customer } from '@/types/customer';

interface CustomerStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  setCustomers: (customers: Customer[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  isLoading: false,
  error: null,
  setCustomers: (customers) => set({ customers }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
