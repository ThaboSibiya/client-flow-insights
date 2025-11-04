import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CustomerFinanceSummary, DebtorNote, CustomerTransaction } from '@/types/finance';
import { toast } from '@/hooks/use-toast';
import { financeCacheService } from '@/services/financeCacheService';

const TRANSACTIONS_PER_PAGE = 20;
const NOTES_PER_PAGE = 10;

export const useCustomerFinancePaginated = (customerId: string) => {
  const { user } = useAuth();
  const [financeSummary, setFinanceSummary] = useState<CustomerFinanceSummary | null>(null);
  const [debtorNotes, setDebtorNotes] = useState<DebtorNote[]>([]);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [transactionPage, setTransactionPage] = useState(0);
  const [notesPage, setNotesPage] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFinanceSummary = useCallback(async () => {
    if (!user || !customerId) return;

    // Check cache first
    const cached = financeCacheService.getFinanceSummary(customerId);
    if (cached) {
      setFinanceSummary(cached);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_finance_summary')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

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
        const summary = newSummary as CustomerFinanceSummary;
        setFinanceSummary(summary);
        financeCacheService.setFinanceSummary(customerId, summary);
      } else {
        const summary = data as CustomerFinanceSummary;
        setFinanceSummary(summary);
        financeCacheService.setFinanceSummary(customerId, summary);
      }
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      toast({
        title: "Error",
        description: "Failed to load finance summary",
        variant: "destructive"
      });
    }
  }, [user, customerId]);

  const fetchDebtorNotes = useCallback(async (page: number = 0, append: boolean = false) => {
    if (!user || !customerId) return;

    try {
      const from = page * NOTES_PER_PAGE;
      const to = from + NOTES_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('debtor_notes')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const notes = (data || []) as DebtorNote[];
      setHasMoreNotes(notes.length === NOTES_PER_PAGE);
      
      if (append) {
        setDebtorNotes(prev => [...prev, ...notes]);
      } else {
        setDebtorNotes(notes);
      }
    } catch (error) {
      console.error('Error fetching debtor notes:', error);
    }
  }, [user, customerId]);

  const fetchTransactions = useCallback(async (page: number = 0, append: boolean = false) => {
    if (!user || !customerId) return;

    try {
      const from = page * TRANSACTIONS_PER_PAGE;
      const to = from + TRANSACTIONS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('customer_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const txns = (data || []) as CustomerTransaction[];
      setHasMoreTransactions(txns.length === TRANSACTIONS_PER_PAGE);
      
      if (append) {
        setTransactions(prev => [...prev, ...txns]);
      } else {
        setTransactions(txns);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [user, customerId]);

  const loadMoreTransactions = useCallback(async () => {
    if (!hasMoreTransactions || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = transactionPage + 1;
    await fetchTransactions(nextPage, true);
    setTransactionPage(nextPage);
    setLoadingMore(false);
  }, [hasMoreTransactions, loadingMore, transactionPage, fetchTransactions]);

  const loadMoreNotes = useCallback(async () => {
    if (!hasMoreNotes || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = notesPage + 1;
    await fetchDebtorNotes(nextPage, true);
    setNotesPage(nextPage);
    setLoadingMore(false);
  }, [hasMoreNotes, loadingMore, notesPage, fetchDebtorNotes]);

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
      const summary = data as CustomerFinanceSummary;
      setFinanceSummary(summary);
      financeCacheService.setFinanceSummary(customerId, summary);
    } catch (error) {
      console.error('Error updating finance summary:', error);
      toast({
        title: "Error",
        description: "Failed to update finance summary",
        variant: "destructive"
      });
    }
  };

  const refreshData = useCallback(() => {
    financeCacheService.invalidateCustomer(customerId);
    setTransactionPage(0);
    setNotesPage(0);
    fetchFinanceSummary();
    fetchDebtorNotes(0, false);
    fetchTransactions(0, false);
  }, [customerId, fetchFinanceSummary, fetchDebtorNotes, fetchTransactions]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFinanceSummary(),
        fetchDebtorNotes(0),
        fetchTransactions(0)
      ]);
      setLoading(false);
    };

    loadData();
  }, [customerId, user, fetchFinanceSummary, fetchDebtorNotes, fetchTransactions]);

  return {
    financeSummary,
    debtorNotes,
    transactions,
    loading,
    loadingMore,
    hasMoreTransactions,
    hasMoreNotes,
    loadMoreTransactions,
    loadMoreNotes,
    addDebtorNote,
    addTransaction,
    updateFinanceSummary,
    refreshData
  };
};
