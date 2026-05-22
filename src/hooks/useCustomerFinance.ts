import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CustomerFinanceSummary, DebtorNote, CustomerTransaction } from '@/types/finance';
import { toast } from '@/hooks/use-toast';

const SUMMARY_COLS = 'id, customer_id, user_id, account_number, current_balance, total_owed, credit_limit, credit_terms, risk_rating, account_status, last_payment_date, last_payment_amount, next_due_date, created_at, updated_at';
const DEBTOR_NOTE_COLS = 'id, customer_id, user_id, note_type, note_content, priority, follow_up_date, created_by, created_at, updated_at';
const TXN_COLS = 'id, customer_id, user_id, transaction_type, reference_number, amount, balance_after, status, due_date, payment_method, description, created_at, updated_at';

export const useCustomerFinance = (customerId: string) => {
  const { user } = useAuth();
  const [financeSummary, setFinanceSummary] = useState<CustomerFinanceSummary | null>(null);
  const [debtorNotes, setDebtorNotes] = useState<DebtorNote[]>([]);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinanceSummary = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('customer_finance_summary')
        .select(SUMMARY_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no summary exists, create a default one
      if (!data) {
        const { data: newSummary, error: createError } = await supabase
          .from('customer_finance_summary')
          .insert({
            customer_id: customerId,
            user_id: user.id,
            account_number: `ACC-${Date.now()}`,
          })
          .select()
          .single();

        if (createError) throw createError;
        setFinanceSummary(newSummary as CustomerFinanceSummary);
      } else {
        setFinanceSummary(data as CustomerFinanceSummary);
      }
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      toast({
        title: "Error",
        description: "Failed to load finance summary",
        variant: "destructive"
      });
    }
  };

  const fetchDebtorNotes = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('debtor_notes')
        .select(DEBTOR_NOTE_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebtorNotes((data || []) as DebtorNote[]);
    } catch (error) {
      console.error('Error fetching debtor notes:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('customer_transactions')
        .select(TXN_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as CustomerTransaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addDebtorNote = async (note: Partial<DebtorNote>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('debtor_notes')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          ...note
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setDebtorNotes(prev => [data as DebtorNote, ...prev]);
      toast({
        title: "Success",
        description: "Note added successfully"
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const addTransaction = async (transaction: Partial<CustomerTransaction>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('customer_transactions')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          ...transaction
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setTransactions(prev => [data as CustomerTransaction, ...prev]);
      
      // Update finance summary balance
      if (financeSummary && transaction.transaction_type === 'payment') {
        const newBalance = financeSummary.current_balance - (transaction.amount || 0);
        await updateFinanceSummary({ current_balance: newBalance });
      }
      
      toast({
        title: "Success",
        description: "Transaction recorded successfully"
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive"
      });
    }
  };

  const updateFinanceSummary = async (updates: Partial<CustomerFinanceSummary>) => {
    if (!user || !customerId || !financeSummary) return;

    try {
      const { data, error } = await supabase
        .from('customer_finance_summary')
        .update(updates)
        .eq('id', financeSummary.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setFinanceSummary(data as CustomerFinanceSummary);
    } catch (error) {
      console.error('Error updating finance summary:', error);
      toast({
        title: "Error",
        description: "Failed to update finance summary",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFinanceSummary(),
        fetchDebtorNotes(),
        fetchTransactions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [customerId, user]);

  return {
    financeSummary,
    debtorNotes,
    transactions,
    loading,
    addDebtorNote,
    addTransaction,
    updateFinanceSummary,
    refreshData: () => {
      fetchFinanceSummary();
      fetchDebtorNotes();
      fetchTransactions();
    }
  };
};
