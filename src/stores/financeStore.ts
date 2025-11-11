import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface FinanceStats {
  totalOverdue: number;
  totalDebtors: number;
  highRiskCount: number;
  criticalCount: number;
  lastUpdated: Date;
}

interface FinanceStoreState {
  stats: FinanceStats;
  lastRefresh: Record<string, Date>; // Track last refresh per customer
  isRefreshing: boolean;
  
  // Actions
  updateStats: (stats: Partial<FinanceStats>) => void;
  markCustomerRefreshed: (customerId: string) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  invalidateCache: () => void;
  invalidateCustomer: (customerId: string) => void;
}

/**
 * Centralized finance state store for cross-page communication
 * Ensures data consistency between main Finance page and customer-specific views
 */
export const useFinanceStore = create<FinanceStoreState>((set) => ({
  stats: {
    totalOverdue: 0,
    totalDebtors: 0,
    highRiskCount: 0,
    criticalCount: 0,
    lastUpdated: new Date(),
  },
  lastRefresh: {},
  isRefreshing: false,

  updateStats: (newStats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        ...newStats,
        lastUpdated: new Date(),
      },
    })),

  markCustomerRefreshed: (customerId) =>
    set((state) => ({
      lastRefresh: {
        ...state.lastRefresh,
        [customerId]: new Date(),
      },
    })),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  invalidateCache: () =>
    set({
      lastRefresh: {},
      stats: {
        totalOverdue: 0,
        totalDebtors: 0,
        highRiskCount: 0,
        criticalCount: 0,
        lastUpdated: new Date(),
      },
    }),

  invalidateCustomer: (customerId) =>
    set((state) => {
      const newLastRefresh = { ...state.lastRefresh };
      delete newLastRefresh[customerId];
      return { lastRefresh: newLastRefresh };
    }),
}));

/**
 * Global event emitter for finance events
 * Allows different parts of the app to communicate finance changes
 */
class FinanceEventBus {
  private listeners: Map<string, Set<(data?: any) => void>> = new Map();

  on(event: string, callback: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  clear() {
    this.listeners.clear();
  }
}

export const financeEventBus = new FinanceEventBus();

// Event types for type safety
export const FINANCE_EVENTS = {
  // Triggered when invoice status changes
  INVOICE_UPDATED: 'finance:invoice:updated',
  
  // Triggered when payment is recorded
  PAYMENT_RECORDED: 'finance:payment:recorded',
  
  // Triggered when reminder is sent
  REMINDER_SENT: 'finance:reminder:sent',
  
  // Triggered when account flag changes
  FLAG_UPDATED: 'finance:flag:updated',
  
  // Triggered when customer finance data needs refresh
  CUSTOMER_REFRESH: 'finance:customer:refresh',
  
  // Triggered when main finance page needs refresh
  GLOBAL_REFRESH: 'finance:global:refresh',
} as const;
