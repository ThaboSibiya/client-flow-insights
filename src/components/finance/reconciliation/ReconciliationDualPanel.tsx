import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link2, Sparkles, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import FloatingActionBar from './FloatingActionBar';
import { Invoice, Payment } from '@/types/financeBackend';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";

interface ReconciliationDualPanelProps {
  invoices: Invoice[];
  payments: Payment[];
  onReconcile: () => void;
}

interface CustomerMap {
  [key: string]: string;
}

type SortField = 'invoice_number' | 'customer' | 'amount' | 'due_date' | 'status' | 'payment_number' | 'payment_date' | 'payment_method';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}


const ReconciliationDualPanel: React.FC<ReconciliationDualPanelProps> = ({ 
  invoices, 
  payments,
  onReconcile 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [customerMap, setCustomerMap] = useState<CustomerMap>({});
  const [invoiceSortConfig, setInvoiceSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [paymentSortConfig, setPaymentSortConfig] = useState<SortConfig>({ field: null, direction: null });

  // Filter data first (needed by handlers)
  const unallocatedPayments = payments.filter(p => !p.invoice_id);
  const unpaidInvoices = invoices.filter(i => 
    i.status !== 'paid' && i.status !== 'cancelled'
  );

  // Fetch customer names
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching customers:', error);
        return;
      }

      const map: CustomerMap = {};
      data.forEach((customer) => {
        map[customer.id] = customer.name;
      });
      setCustomerMap(map);
    };

    fetchCustomers();
  }, [user]);

  const handleManualMatch = async () => {
    if (!selectedInvoice || !selectedPayment || !user) return;

    setIsMatching(true);
    try {
      // Update payment with invoice_id
      const { error } = await supabase
        .from('payments')
        .update({ invoice_id: selectedInvoice.id })
        .eq('id', selectedPayment.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment ${selectedPayment.payment_number} matched to Invoice ${selectedInvoice.invoice_number}`,
      });

      setSelectedInvoice(null);
      setSelectedPayment(null);
      onReconcile();
    } catch (error) {
      console.error('Manual match error:', error);
      toast({
        title: "Error",
        description: "Failed to match payment to invoice",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleBatchMatch = async () => {
    if (!user || selectedInvoices.size === 0 || selectedPayments.size === 0) return;

    setIsMatching(true);
    try {
      const invoiceList = Array.from(selectedInvoices).map(id => 
        unpaidInvoices.find(inv => inv.id === id)
      ).filter(Boolean) as Invoice[];
      
      const paymentList = Array.from(selectedPayments).map(id => 
        unallocatedPayments.find(pay => pay.id === id)
      ).filter(Boolean) as Payment[];

      // Smart pairing algorithm
      const pairs: Array<{ invoiceId: string; paymentId: string }> = [];
      const usedPayments = new Set<string>();

      for (const invoice of invoiceList) {
        // Try to find exact amount match first
        let bestMatch = paymentList.find(payment => 
          !usedPayments.has(payment.id) &&
          payment.customer_id === invoice.customer_id &&
          Math.abs(payment.amount - invoice.total_amount) < 0.01
        );

        // If no exact match, find closest amount match for same customer
        if (!bestMatch) {
          bestMatch = paymentList
            .filter(payment => 
              !usedPayments.has(payment.id) &&
              payment.customer_id === invoice.customer_id
            )
            .sort((a, b) => 
              Math.abs(a.amount - invoice.total_amount) - 
              Math.abs(b.amount - invoice.total_amount)
            )[0];
        }

        if (bestMatch) {
          pairs.push({
            invoiceId: invoice.id,
            paymentId: bestMatch.id,
          });
          usedPayments.add(bestMatch.id);
        }
      }

      if (pairs.length === 0) {
        toast({
          title: "No Matches Found",
          description: "Could not find suitable invoice-payment pairs",
          variant: "destructive",
        });
        setIsMatching(false);
        return;
      }

      // Execute all matches
      const updatePromises = pairs.map(pair => 
        supabase
          .from('payments')
          .update({ invoice_id: pair.invoiceId })
          .eq('id', pair.paymentId)
          .eq('user_id', user.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `Matched ${pairs.length - errors.length} of ${pairs.length} pairs`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Batch Match Complete",
          description: `Successfully matched ${pairs.length} invoice-payment pairs`,
        });
      }

      setSelectedInvoices(new Set());
      setSelectedPayments(new Set());
      setSelectedInvoice(null);
      setSelectedPayment(null);
      onReconcile();
    } catch (error) {
      console.error('Batch match error:', error);
      toast({
        title: "Error",
        description: "Failed to complete batch matching",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleAutoMatch = async () => {
    if (!user) return;

    setIsAutoMatching(true);
    try {
      const { data, error } = await supabase.functions.invoke('finance-reconcile-transactions', {
        body: { 
          customerId: null, // Match for all customers
          autoMatch: true 
        }
      });

      if (error) throw error;

      toast({
        title: "Auto-Match Complete",
        description: `Matched ${data?.results?.auto_matched || 0} payments automatically`,
      });

      onReconcile();
    } catch (error) {
      console.error('Auto-match error:', error);
      toast({
        title: "Error",
        description: "Failed to auto-match transactions",
        variant: "destructive",
      });
    } finally {
      setIsAutoMatching(false);
    }
  };

  const handleMarkPartial = async () => {
    if (!selectedInvoice || !user) return;

    setIsMatching(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'partial' })
        .eq('id', selectedInvoice.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Invoice Marked as Partial",
        description: `Invoice ${selectedInvoice.invoice_number} marked as partially paid`,
      });

      setSelectedInvoice(null);
      onReconcile();
    } catch (error) {
      console.error('Mark partial error:', error);
      toast({
        title: "Error",
        description: "Failed to mark invoice as partial",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleFlagForReview = async () => {
    if ((!selectedInvoice && !selectedPayment) || !user) return;

    setIsMatching(true);
    try {
      const flagData = {
        customer_id: selectedInvoice?.customer_id || selectedPayment?.customer_id,
        user_id: user.id,
        flag_type: 'review_required',
        flag_reason: selectedInvoice && selectedPayment
          ? `Manual review needed for Invoice ${selectedInvoice.invoice_number} and Payment ${selectedPayment.payment_number}`
          : selectedInvoice
          ? `Manual review needed for Invoice ${selectedInvoice.invoice_number}`
          : `Manual review needed for Payment ${selectedPayment.payment_number}`,
        status: 'active',
        priority: 'normal',
        flagged_by: user.email || 'Unknown',
      };

      const { error } = await supabase
        .from('account_flags')
        .insert(flagData);

      if (error) throw error;

      toast({
        title: "Flagged for Review",
        description: "Transaction(s) flagged for manual review",
      });

      setSelectedInvoice(null);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Flag for review error:', error);
      toast({
        title: "Error",
        description: "Failed to flag for review",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleSaveReconciliation = async () => {
    toast({
      title: "Reconciliation Saved",
      description: "All changes have been saved successfully",
    });
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const toggleAllInvoices = () => {
    if (selectedInvoices.size === sortedUnpaidInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(sortedUnpaidInvoices.map(inv => inv.id)));
    }
  };

  const toggleAllPayments = () => {
    if (selectedPayments.size === sortedUnallocatedPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(sortedUnallocatedPayments.map(pay => pay.id)));
    }
  };

  // Sorting logic
  const handleInvoiceSort = (field: SortField) => {
    setInvoiceSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePaymentSort = (field: SortField) => {
    setPaymentSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (field: SortField, sortConfig: SortConfig) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 text-quikle-primary" />
      : <ArrowDown className="h-4 w-4 ml-1 text-quikle-primary" />;
  };

  // Sorted invoices
  const sortedUnpaidInvoices = useMemo(() => {
    const sorted = [...unpaidInvoices];
    if (invoiceSortConfig.field && invoiceSortConfig.direction) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (invoiceSortConfig.field) {
          case 'invoice_number':
            aValue = a.invoice_number;
            bValue = b.invoice_number;
            break;
          case 'customer':
            aValue = customerMap[a.customer_id] || '';
            bValue = customerMap[b.customer_id] || '';
            break;
          case 'amount':
            aValue = a.total_amount;
            bValue = b.total_amount;
            break;
          case 'due_date':
            aValue = new Date(a.due_date).getTime();
            bValue = new Date(b.due_date).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return invoiceSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return invoiceSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [unpaidInvoices, invoiceSortConfig, customerMap]);

  // Sorted payments
  const sortedUnallocatedPayments = useMemo(() => {
    const sorted = [...unallocatedPayments];
    if (paymentSortConfig.field && paymentSortConfig.direction) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (paymentSortConfig.field) {
          case 'payment_number':
            aValue = a.payment_number;
            bValue = b.payment_number;
            break;
          case 'customer':
            aValue = customerMap[a.customer_id] || '';
            bValue = customerMap[b.customer_id] || '';
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'payment_date':
            aValue = new Date(a.payment_date).getTime();
            bValue = new Date(b.payment_date).getTime();
            break;
          case 'payment_method':
            aValue = a.payment_method || '';
            bValue = b.payment_method || '';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return paymentSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return paymentSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [unallocatedPayments, paymentSortConfig, customerMap]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: 'secondary', label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      sent: { variant: 'default', label: 'Sent', className: 'bg-blue-100 text-blue-800' },
      paid: { variant: 'default', label: 'Paid', className: 'bg-green-100 text-green-800' },
      overdue: { variant: 'destructive', label: 'Overdue', className: 'bg-red-100 text-red-800' },
      partial: { variant: 'secondary', label: 'Partial', className: 'bg-orange-100 text-orange-800' },
      completed: { variant: 'default', label: 'Completed', className: 'bg-green-100 text-green-800' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedInvoice={selectedInvoice}
        selectedPayment={selectedPayment}
        selectedInvoicesCount={selectedInvoices.size}
        selectedPaymentsCount={selectedPayments.size}
        batchMode={batchMode}
        onMatch={handleManualMatch}
        onBatchMatch={handleBatchMatch}
        onMarkPartial={handleMarkPartial}
        onFlagForReview={handleFlagForReview}
        onSaveReconciliation={handleSaveReconciliation}
        onToggleBatchMode={() => {
          setBatchMode(!batchMode);
          if (batchMode) {
            setSelectedInvoices(new Set());
            setSelectedPayments(new Set());
          }
        }}
        isProcessing={isMatching || isAutoMatching}
      />

      {/* Action Buttons */}
      <Card className="border-quikle-silver/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-quikle-charcoal mb-1">
                Reconciliation Actions
              </h3>
              <p className="text-sm text-quikle-slate">
                Select an invoice and payment to match manually, or use AI auto-matching
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleManualMatch}
                disabled={!selectedInvoice || !selectedPayment || isMatching}
                variant="outline"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {isMatching ? 'Matching...' : 'Match Selected'}
              </Button>
              <Button
                onClick={handleAutoMatch}
                disabled={isAutoMatching}
                className="bg-gradient-to-r from-quikle-primary to-quikle-secondary"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAutoMatching ? 'Auto-Matching...' : 'AI Auto-Match'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dual Panel Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Invoices Table */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b">
            <CardTitle className="text-quikle-charcoal">
              Unpaid Invoices ({unpaidInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {sortedUnpaidInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-quikle-slate">All invoices are paid</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {batchMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedInvoices.size === sortedUnpaidInvoices.length && sortedUnpaidInvoices.length > 0}
                            onCheckedChange={toggleAllInvoices}
                          />
                        </TableHead>
                      )}
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleInvoiceSort('invoice_number')}
                      >
                        <div className="flex items-center">
                          Invoice #
                          {getSortIcon('invoice_number', invoiceSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleInvoiceSort('customer')}
                      >
                        <div className="flex items-center">
                          Customer
                          {getSortIcon('customer', invoiceSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-gray-50"
                        onClick={() => handleInvoiceSort('amount')}
                      >
                        <div className="flex items-center justify-end">
                          Amount
                          {getSortIcon('amount', invoiceSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleInvoiceSort('due_date')}
                      >
                        <div className="flex items-center">
                          Due Date
                          {getSortIcon('due_date', invoiceSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleInvoiceSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon('status', invoiceSortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUnpaidInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        onClick={() => {
                          if (batchMode) {
                            toggleInvoiceSelection(invoice.id);
                          } else {
                            setSelectedInvoice(invoice);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          batchMode && selectedInvoices.has(invoice.id)
                            ? "bg-blue-50 hover:bg-blue-100"
                            : !batchMode && selectedInvoice?.id === invoice.id
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "hover:bg-gray-50"
                        )}
                      >
                        {batchMode && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedInvoices.has(invoice.id)}
                              onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {!batchMode && selectedInvoice?.id === invoice.id && (
                              <CheckCircle className="h-4 w-4 text-quikle-primary" />
                            )}
                            {invoice.invoice_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customerMap[invoice.customer_id] || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${invoice.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Unallocated Payments Table */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b">
            <CardTitle className="text-quikle-charcoal">
              Unallocated Payments ({unallocatedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {sortedUnallocatedPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-quikle-slate">All payments are allocated</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {batchMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedPayments.size === sortedUnallocatedPayments.length && sortedUnallocatedPayments.length > 0}
                            onCheckedChange={toggleAllPayments}
                          />
                        </TableHead>
                      )}
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePaymentSort('payment_number')}
                      >
                        <div className="flex items-center">
                          Payment #
                          {getSortIcon('payment_number', paymentSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePaymentSort('customer')}
                      >
                        <div className="flex items-center">
                          Customer
                          {getSortIcon('customer', paymentSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePaymentSort('amount')}
                      >
                        <div className="flex items-center justify-end">
                          Amount
                          {getSortIcon('amount', paymentSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePaymentSort('payment_date')}
                      >
                        <div className="flex items-center">
                          Date
                          {getSortIcon('payment_date', paymentSortConfig)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePaymentSort('payment_method')}
                      >
                        <div className="flex items-center">
                          Method
                          {getSortIcon('payment_method', paymentSortConfig)}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUnallocatedPayments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        onClick={() => {
                          if (batchMode) {
                            togglePaymentSelection(payment.id);
                          } else {
                            setSelectedPayment(payment);
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          batchMode && selectedPayments.has(payment.id)
                            ? "bg-green-50 hover:bg-green-100"
                            : !batchMode && selectedPayment?.id === payment.id
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        )}
                      >
                        {batchMode && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedPayments.has(payment.id)}
                              onCheckedChange={() => togglePaymentSelection(payment.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {!batchMode && selectedPayment?.id === payment.id && (
                              <CheckCircle className="h-4 w-4 text-quikle-primary" />
                            )}
                            {payment.payment_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customerMap[payment.customer_id] || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            {payment.payment_method || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReconciliationDualPanel;
