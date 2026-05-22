import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useFinanceEvents } from './useFinanceEvents';
import { useFinanceStore } from '@/stores/financeStore';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export interface DebtorCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_address: string | null;
  status: string;
  finance_summary?: {
    current_balance: number;
    total_owed: number;
    credit_limit: number;
    risk_rating: string;
    account_status: string;
    last_payment_date: string | null;
    next_due_date: string | null;
  };
  overdue_invoices?: any[];
  total_overdue?: number;
  days_overdue?: number;
}

export const useDebtorData = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [debtors, setDebtors] = useState<DebtorCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOverdue: 0,
    totalDebtors: 0,
    highRiskCount: 0,
    criticalCount: 0,
  });

  const fetchDebtorData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch customers with finance summary
      let custQuery = supabase
        .from('customers')
        .select('*, customer_finance_summary(*)')
        .eq('user_id', user.id);

      if (workspaceId) {
        custQuery = custQuery.eq('workspace_id', workspaceId);
      }

      const { data: customersData, error: customersError } = await custQuery;

      if (customersError) throw customersError;

      // Fetch overdue invoices
      let invQuery = supabase
        .from('invoices')
        .select('id, customer_id, due_date, status, total_amount')
        .eq('user_id', user.id)
        .in('status', ['overdue', 'sent', 'partial']);

      if (workspaceId) {
        invQuery = invQuery.eq('workspace_id', workspaceId);
      }

      const { data: invoicesData, error: invoicesError } = await invQuery
        .order('due_date', { ascending: true });

      if (invoicesError) throw invoicesError;

      // Process data
      const debtorsWithOverdue = customersData?.map(customer => {
        const customerInvoices = invoicesData?.filter(inv => inv.customer_id === customer.id) || [];
        const overdueInvoices = customerInvoices.filter(inv => {
          const dueDate = new Date(inv.due_date);
          return dueDate < new Date() && inv.status !== 'paid';
        });

        const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        const oldestOverdue = overdueInvoices[0];
        const daysOverdue = oldestOverdue 
          ? Math.floor((new Date().getTime() - new Date(oldestOverdue.due_date).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          ...customer,
          finance_summary: customer.customer_finance_summary?.[0],
          overdue_invoices: overdueInvoices,
          total_overdue: totalOverdue,
          days_overdue: daysOverdue,
        };
      }) || [];

      // Filter to only customers with overdue amounts or flagged accounts
      const activeDebtors = debtorsWithOverdue.filter(d => 
        (d.total_overdue && d.total_overdue > 0) || 
        d.finance_summary?.account_status === 'suspended' ||
        d.finance_summary?.account_status === 'collection'
      );

      setDebtors(activeDebtors);

      // Calculate stats
      const totalOverdue = activeDebtors.reduce((sum, d) => sum + (d.total_overdue || 0), 0);
      const highRiskCount = activeDebtors.filter(d => 
        d.finance_summary?.risk_rating === 'high'
      ).length;
      const criticalCount = activeDebtors.filter(d => 
        d.finance_summary?.risk_rating === 'critical' || 
        d.finance_summary?.account_status === 'collection'
      ).length;

      setStats({
        totalOverdue,
        totalDebtors: activeDebtors.length,
        highRiskCount,
        criticalCount,
      });

    } catch (error) {
      console.error('Error fetching debtor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtorData();
  }, [user]);

  // Listen for finance events from other pages
  useFinanceEvents({
    onPaymentRecorded: () => {
      console.log('Payment recorded - refreshing debtor data');
      fetchDebtorData();
    },
    onInvoiceUpdated: () => {
      console.log('Invoice updated - refreshing debtor data');
      fetchDebtorData();
    },
    onReminderSent: () => {
      console.log('Reminder sent - refreshing debtor data');
      fetchDebtorData();
    },
    onGlobalRefresh: () => {
      console.log('Global refresh triggered - refreshing debtor data');
      fetchDebtorData();
    },
  });

  // Update global stats when data changes
  useEffect(() => {
    useFinanceStore.getState().updateStats(stats);
  }, [stats]);

  return {
    debtors,
    loading,
    stats,
    refetch: fetchDebtorData,
  };
};
