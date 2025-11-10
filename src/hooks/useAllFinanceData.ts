import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Invoice, Payment } from '@/types/financeBackend';

export const useAllFinanceData = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
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
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
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
  }, [user]);

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
