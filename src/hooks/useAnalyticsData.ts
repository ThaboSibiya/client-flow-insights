
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface AnalyticsMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  pendingCustomers: number;
  finalisedCustomers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalRevenue: number;
  avgResponseTime: number;
  customerGrowthRate: number;
  ticketResolutionRate: number;
}

export interface TimeSeriesData {
  name: string;
  value: number;
  date?: Date;
}

export interface CustomerStatusData {
  name: string;
  value: number;
  color?: string;
}

export interface ImportedDataset {
  id: string;
  name: string;
  data: Record<string, unknown>[];
  columns: string[];
  importedAt: Date;
  rowCount: number;
}

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [customerTimeSeries, setCustomerTimeSeries] = useState<TimeSeriesData[]>([]);
  const [revenueTimeSeries, setRevenueTimeSeries] = useState<TimeSeriesData[]>([]);
  const [ticketTimeSeries, setTicketTimeSeries] = useState<TimeSeriesData[]>([]);
  const [importedDatasets, setImportedDatasets] = useState<ImportedDataset[]>([]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch customers data
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, status, created_at, updated_at')
        .eq('user_id', user.id);

      if (customersError) throw customersError;

      // Fetch tickets data
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, status, created_at, resolved_at, resolution_time_minutes')
        .eq('user_id', user.id);

      // Fetch invoices for revenue data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, total_amount, status, created_at, paid_date')
        .eq('user_id', user.id);

      // Calculate metrics
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter(c => c.status === 'existing' || c.status === 'new').length || 0;
      const newCustomers = customers?.filter(c => c.status === 'new').length || 0;
      const pendingCustomers = customers?.filter(c => c.status === 'pending').length || 0;
      const finalisedCustomers = customers?.filter(c => c.status === 'finalised').length || 0;

      const totalTickets = tickets?.length || 0;
      const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in-progress').length || 0;
      const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

      const totalRevenue = invoices?.filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

      const avgResponseTime = tickets?.length 
        ? tickets.reduce((sum, t) => sum + (t.resolution_time_minutes || 0), 0) / tickets.length / 60
        : 0;

      const ticketResolutionRate = totalTickets > 0 
        ? Math.round((resolvedTickets / totalTickets) * 100) 
        : 0;

      // Calculate growth rate (comparing last 30 days to previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentCustomers = customers?.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length || 0;
      const previousCustomers = customers?.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
      }).length || 0;

      const customerGrowthRate = previousCustomers > 0 
        ? Math.round(((recentCustomers - previousCustomers) / previousCustomers) * 100)
        : recentCustomers > 0 ? 100 : 0;

      setMetrics({
        totalCustomers,
        activeCustomers,
        newCustomers,
        pendingCustomers,
        finalisedCustomers,
        totalTickets,
        openTickets,
        resolvedTickets,
        totalRevenue,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customerGrowthRate,
        ticketResolutionRate
      });

      // Generate time series data for the past 6 months
      const monthlyData = generateMonthlyTimeSeries(customers || [], invoices || [], tickets || []);
      setCustomerTimeSeries(monthlyData.customers);
      setRevenueTimeSeries(monthlyData.revenue);
      setTicketTimeSeries(monthlyData.tickets);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const addImportedDataset = useCallback((dataset: ImportedDataset) => {
    setImportedDatasets(prev => [dataset, ...prev]);
  }, []);

  const removeImportedDataset = useCallback((id: string) => {
    setImportedDatasets(prev => prev.filter(d => d.id !== id));
  }, []);

  const customerStatusData = useMemo((): CustomerStatusData[] => {
    if (!metrics) return [];
    return [
      { name: 'Active', value: metrics.activeCustomers, color: 'hsl(var(--chart-1))' },
      { name: 'Pending', value: metrics.pendingCustomers, color: 'hsl(var(--chart-2))' },
      { name: 'Finalised', value: metrics.finalisedCustomers, color: 'hsl(var(--chart-3))' }
    ];
  }, [metrics]);

  return {
    isLoading,
    error,
    metrics,
    customerTimeSeries,
    revenueTimeSeries,
    ticketTimeSeries,
    customerStatusData,
    importedDatasets,
    addImportedDataset,
    removeImportedDataset,
    refetch: fetchAnalyticsData
  };
};

function generateMonthlyTimeSeries(
  customers: { created_at: string }[],
  invoices: { total_amount: number; created_at: string; status: string }[],
  tickets: { created_at: string }[]
) {
  const months: TimeSeriesData[] = [];
  const revenueData: TimeSeriesData[] = [];
  const ticketData: TimeSeriesData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const customerCount = customers.filter(c => {
      const createdAt = new Date(c.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;

    const monthRevenue = invoices
      .filter(i => {
        const createdAt = new Date(i.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd && i.status === 'paid';
      })
      .reduce((sum, i) => sum + (i.total_amount || 0), 0);

    const ticketCount = tickets.filter(t => {
      const createdAt = new Date(t.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;

    months.push({ name: monthName, value: customerCount, date: monthStart });
    revenueData.push({ name: monthName, value: monthRevenue, date: monthStart });
    ticketData.push({ name: monthName, value: ticketCount, date: monthStart });
  }

  return { customers: months, revenue: revenueData, tickets: ticketData };
}
