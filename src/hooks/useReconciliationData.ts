import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Invoice, Payment } from '@/types/financeBackend';
import { ReconciliationFilters } from '@/components/finance/reconciliation/ReconciliationPage';
import { ReconciliationSummaryData } from '@/components/finance/reconciliation/ReconciliationSummary';
import { ReconciliationRecord } from '@/components/finance/reconciliation/ReconciliationHistory';

export const useReconciliationData = (filters: ReconciliationFilters) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customerMap, setCustomerMap] = useState<{ [key: string]: string }>({});
  const [reconciliationHistory, setReconciliationHistory] = useState<ReconciliationRecord[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummaryData>({
    totalInvoices: 0,
    totalPayments: 0,
    matched: 0,
    unmatched: 0,
    discrepancies: 0,
    totalInvoiceAmount: 0,
    totalPaymentAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Build invoice query
      let invoiceQuery = supabase
        .from('invoices')
        .select('id, customer_id, user_id, invoice_number, amount, tax_amount, total_amount, status, due_date, issue_date, paid_date, description, terms, notes, created_at, updated_at, workspace_id')
        .eq('user_id', user.id);

      if (filters.customerId) {
        invoiceQuery = invoiceQuery.eq('customer_id', filters.customerId);
      }

      if (filters.status === 'reconciled') {
        invoiceQuery = invoiceQuery.eq('status', 'paid');
      } else if (filters.status === 'unreconciled') {
        invoiceQuery = invoiceQuery.in('status', ['pending', 'sent', 'partial', 'overdue']);
      }

      if (filters.dateFrom) {
        invoiceQuery = invoiceQuery.gte('issue_date', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        invoiceQuery = invoiceQuery.lte('issue_date', filters.dateTo.toISOString());
      }

      // Build payment query
      let paymentQuery = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id);

      if (filters.customerId) {
        paymentQuery = paymentQuery.eq('customer_id', filters.customerId);
      }

      if (filters.dateFrom) {
        paymentQuery = paymentQuery.gte('payment_date', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        paymentQuery = paymentQuery.lte('payment_date', filters.dateTo.toISOString());
      }

      const [invoicesResult, paymentsResult] = await Promise.all([
        invoiceQuery,
        paymentQuery,
      ]);

      if (invoicesResult.error) throw invoicesResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      const fetchedInvoices = (invoicesResult.data || []) as Invoice[];
      const fetchedPayments = (paymentsResult.data || []) as Payment[];

      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);

      // Calculate summary
      const totalInvoiceAmount = fetchedInvoices.reduce(
        (sum, inv) => sum + (inv.total_amount || 0),
        0
      );
      const totalPaymentAmount = fetchedPayments.reduce(
        (sum, pay) => sum + (pay.amount || 0),
        0
      );

      const matched = fetchedPayments.filter(p => p.invoice_id).length;
      const unmatched = fetchedPayments.filter(p => !p.invoice_id).length;

      setSummary({
        totalInvoices: fetchedInvoices.length,
        totalPayments: fetchedPayments.length,
        matched,
        unmatched,
        discrepancies: Math.abs(totalInvoiceAmount - totalPaymentAmount) > 0.01 ? 1 : 0,
        totalInvoiceAmount,
        totalPaymentAmount,
      });

      // Fetch customer names
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, name')
        .eq('user_id', user.id);

      const map: { [key: string]: string } = {};
      (customersData || []).forEach((customer: any) => {
        map[customer.id] = customer.name;
      });
      setCustomerMap(map);

      // Mock reconciliation history (would come from audit logs in production)
      setReconciliationHistory([]);
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    invoices,
    payments,
    reconciliationHistory,
    summary,
    customerMap,
    isLoading,
    refetch: fetchData,
  };
};
