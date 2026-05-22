import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Invoice, Payment } from '@/types/financeBackend';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

const INVOICE_COLS = 'id, customer_id, user_id, invoice_number, amount, tax_amount, total_amount, status, due_date, issue_date, paid_date, description, terms, notes, created_at, updated_at';
const PAYMENT_COLS = 'id, customer_id, invoice_id, user_id, payment_number, amount, payment_date, payment_method, reference_number, status, notes, created_at, updated_at';


export const useAllFinanceData = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('invoices')
        .select(INVOICE_COLS)
        .eq('user_id', user.id);
      if (workspaceId) query = query.eq('workspace_id', workspaceId);
      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices((data || []) as Invoice[]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPayments = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('payments')
        .select(PAYMENT_COLS)
        .eq('user_id', user.id);
      if (workspaceId) query = query.eq('workspace_id', workspaceId);
      const { data, error } = await query
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInvoices(),
        fetchPayments()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user, workspaceId]);

  return {
    invoices,
    payments,
    loading,
    updateInvoiceStatus,
    refreshData: () => {
      fetchInvoices();
      fetchPayments();
    }
  };
};
