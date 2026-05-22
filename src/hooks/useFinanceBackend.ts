import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { Invoice, Payment, FinanceNote, AccountFlag } from '@/types/financeBackend';
import { toast } from '@/hooks/use-toast';
import { financeAuditService } from '@/services/financeAuditService';
import { financeEventBus, FINANCE_EVENTS, useFinanceStore } from '@/stores/financeStore';

const INVOICE_COLS = 'id, customer_id, user_id, invoice_number, amount, tax_amount, total_amount, status, due_date, issue_date, paid_date, description, terms, notes, created_at, updated_at';
const PAYMENT_COLS = 'id, customer_id, invoice_id, user_id, payment_number, amount, payment_date, payment_method, reference_number, status, notes, created_at, updated_at';
const FINANCE_NOTE_COLS = 'id, customer_id, user_id, note, tag, created_by, created_at, updated_at';
const ACCOUNT_FLAG_COLS = 'id, customer_id, user_id, flag_type, flag_reason, status, priority, flagged_by, resolved_by, resolved_at, created_at, updated_at';

export const useFinanceBackend = (customerId: string) => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financeNotes, setFinanceNotes] = useState<FinanceNote[]>([]);
  const [accountFlags, setAccountFlags] = useState<AccountFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(INVOICE_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices((data || []) as Invoice[]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPayments = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(PAYMENT_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments((data || []) as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchFinanceNotes = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('finance_notes')
        .select(FINANCE_NOTE_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFinanceNotes((data || []) as FinanceNote[]);
    } catch (error) {
      console.error('Error fetching finance notes:', error);
    }
  };

  const fetchAccountFlags = async () => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('account_flags')
        .select(ACCOUNT_FLAG_COLS)
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccountFlags((data || []) as AccountFlag[]);
    } catch (error) {
      console.error('Error fetching account flags:', error);
    }
  };

  const createInvoice = async (invoice: Partial<Invoice>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          workspace_id: workspaceId || null,
          ...invoice
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setInvoices(prev => [data as Invoice, ...prev]);
      
      // Log action
      await financeAuditService.logCreate('invoice', data, customerId);
      
      toast({
        title: "Success",
        description: "Invoice created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const createPayment = async (payment: Partial<Payment>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          workspace_id: workspaceId || null,
          ...payment
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setPayments(prev => [data as Payment, ...prev]);
      
      // Log payment action
      await financeAuditService.logPayment(data, customerId);
      
      // Emit event for cross-page communication
      financeEventBus.emit(FINANCE_EVENTS.PAYMENT_RECORDED, { customerId, payment: data });
      
      // Invalidate customer cache
      useFinanceStore.getState().invalidateCustomer(customerId);
      
      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });
      
      // Refresh invoices as payment may have updated invoice status
      await fetchInvoices();
      
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const addFinanceNote = async (note: Partial<FinanceNote>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('finance_notes')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          ...note
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setFinanceNotes(prev => [data as FinanceNote, ...prev]);
      
      // Log action
      await financeAuditService.logCreate('note', data, customerId);
      
      toast({
        title: "Success",
        description: "Note added successfully"
      });
    } catch (error) {
      console.error('Error adding finance note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const createAccountFlag = async (flag: Partial<AccountFlag>) => {
    if (!user || !customerId) return;

    try {
      const { data, error } = await supabase
        .from('account_flags')
        .insert([{
          customer_id: customerId,
          user_id: user.id,
          ...flag
        } as any])
        .select()
        .single();

      if (error) throw error;
      
      setAccountFlags(prev => [data as AccountFlag, ...prev]);
      
      // Log action
      await financeAuditService.logCreate('account_flag', data, customerId);
      
      toast({
        title: "Success",
        description: "Account flag created successfully"
      });
    } catch (error) {
      console.error('Error creating account flag:', error);
      toast({
        title: "Error",
        description: "Failed to create account flag",
        variant: "destructive"
      });
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    if (!user) return;

    try {
      // Get old value for audit log
      const oldInvoice = invoices.find(inv => inv.id === invoiceId);
      
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log action
      if (oldInvoice) {
        await financeAuditService.logUpdate(
          'invoice',
          invoiceId,
          { status: oldInvoice.status },
          { status },
          customerId
        );
      }
      
      // Emit event for cross-page communication
      financeEventBus.emit(FINANCE_EVENTS.INVOICE_UPDATED, { 
        customerId, 
        invoiceId, 
        oldStatus: oldInvoice?.status, 
        newStatus: status 
      });
      
      // Invalidate customer cache
      useFinanceStore.getState().invalidateCustomer(customerId);
      
      await fetchInvoices();
      toast({
        title: "Success",
        description: "Invoice status updated"
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
    }
  };

  const resolveAccountFlag = async (flagId: string, resolvedBy: string) => {
    if (!user) return;

    try {
      // Get old value for audit log
      const oldFlag = accountFlags.find(flag => flag.id === flagId);
      
      const { error } = await supabase
        .from('account_flags')
        .update({ 
          status: 'resolved',
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', flagId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Log action
      if (oldFlag) {
        await financeAuditService.logUpdate(
          'account_flag',
          flagId,
          { status: oldFlag.status },
          { status: 'resolved', resolved_by: resolvedBy },
          customerId
        );
      }
      
      // Emit event for cross-page communication
      financeEventBus.emit(FINANCE_EVENTS.FLAG_UPDATED, { customerId, flagId, status: 'resolved' });
      
      // Invalidate customer cache
      useFinanceStore.getState().invalidateCustomer(customerId);
      
      await fetchAccountFlags();
      toast({
        title: "Success",
        description: "Account flag resolved"
      });
    } catch (error) {
      console.error('Error resolving flag:', error);
      toast({
        title: "Error",
        description: "Failed to resolve flag",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInvoices(),
        fetchPayments(),
        fetchFinanceNotes(),
        fetchAccountFlags()
      ]);
      setLoading(false);
    };

    loadData();
  }, [customerId, user]);

  return {
    invoices,
    payments,
    financeNotes,
    accountFlags,
    loading,
    createInvoice,
    createPayment,
    addFinanceNote,
    createAccountFlag,
    updateInvoiceStatus,
    resolveAccountFlag,
    refreshData: () => {
      fetchInvoices();
      fetchPayments();
      fetchFinanceNotes();
      fetchAccountFlags();
    }
  };
};
