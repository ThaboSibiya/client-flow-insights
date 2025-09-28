import { useMemo, useCallback } from 'react';
import { Customer } from '@/types/customer';

interface PerformanceMetrics {
  totalCustomers: number;
  customersByStatus: Record<string, number>;
  averageTicketCount: number;
  recentlyUpdated: Customer[];
}

interface CustomerPerformanceHook {
  metrics: PerformanceMetrics;
  optimizeCustomerList: (customers: Customer[]) => Customer[];
  memoizedCustomerMap: Map<string, Customer>;
  getCustomerById: (id: string) => Customer | undefined;
}

export const useCustomerPerformance = (customers: Customer[]): CustomerPerformanceHook => {
  
  // Memoized customer map for O(1) lookups
  const memoizedCustomerMap = useMemo(() => {
    return new Map(customers.map(customer => [customer.id, customer]));
  }, [customers]);

  // Fast customer lookup function
  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return memoizedCustomerMap.get(id);
  }, [memoizedCustomerMap]);

  // Optimized customer list with performance enhancements
  const optimizeCustomerList = useCallback((customerList: Customer[]): Customer[] => {
    // Sort by last update date for better user experience
    return customerList.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA; // Most recent first
    });
  }, []);

  // Memoized performance metrics calculation
  const metrics = useMemo((): PerformanceMetrics => {
    const totalCustomers = customers.length;
    
    const customersByStatus = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTickets = customers.reduce((sum, customer) => {
      return sum + (customer.ticketCount || 0);
    }, 0);
    
    const averageTicketCount = totalCustomers > 0 ? totalTickets / totalCustomers : 0;

    // Get recently updated customers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyUpdated = customers
      .filter(customer => new Date(customer.updatedAt) > sevenDaysAgo)
      .slice(0, 10); // Limit to 10 for performance

    return {
      totalCustomers,
      customersByStatus,
      averageTicketCount: Math.round(averageTicketCount * 100) / 100, // Round to 2 decimal places
      recentlyUpdated,
    };
  }, [customers]);

  return {
    metrics,
    optimizeCustomerList,
    memoizedCustomerMap,
    getCustomerById,
  };
};