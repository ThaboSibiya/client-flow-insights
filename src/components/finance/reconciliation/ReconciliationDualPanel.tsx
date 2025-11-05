import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, DollarSign, Link2, Sparkles, CheckCircle } from "lucide-react";
import { Invoice, Payment } from '@/types/financeBackend';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ReconciliationDualPanelProps {
  invoices: Invoice[];
  payments: Payment[];
  onReconcile: () => void;
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
  const [isMatching, setIsMatching] = useState(false);
  const [isAutoMatching, setIsAutoMatching] = useState(false);

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

  const unallocatedPayments = payments.filter(p => !p.invoice_id);
  const unpaidInvoices = invoices.filter(i => 
    i.status !== 'paid' && i.status !== 'cancelled'
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      sent: { variant: 'default', label: 'Sent' },
      paid: { variant: 'default', label: 'Paid' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      partial: { variant: 'secondary', label: 'Partial' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
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

      {/* Dual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Invoices Panel */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <FileText className="h-5 w-5 text-blue-600" />
              Unpaid Invoices ({unpaidInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-3">
                {unpaidInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-quikle-slate">All invoices are paid</p>
                  </div>
                ) : (
                  unpaidInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedInvoice?.id === invoice.id
                          ? 'border-quikle-primary bg-blue-50 shadow-md'
                          : 'border-quikle-silver/30 hover:border-quikle-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-quikle-charcoal">
                            {invoice.invoice_number}
                          </p>
                          <p className="text-sm text-quikle-slate">
                            Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-quikle-charcoal">
                          ${invoice.total_amount.toLocaleString()}
                        </p>
                        {selectedInvoice?.id === invoice.id && (
                          <CheckCircle className="h-5 w-5 text-quikle-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Unallocated Payments Panel */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50">
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <DollarSign className="h-5 w-5 text-green-600" />
              Unallocated Payments ({unallocatedPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-3">
                {unallocatedPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-quikle-slate">All payments are allocated</p>
                  </div>
                ) : (
                  unallocatedPayments.map((payment) => (
                    <div
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPayment?.id === payment.id
                          ? 'border-quikle-primary bg-green-50 shadow-md'
                          : 'border-quikle-silver/30 hover:border-quikle-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-quikle-charcoal">
                            {payment.payment_number}
                          </p>
                          <p className="text-sm text-quikle-slate">
                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant="secondary">{payment.payment_method || 'N/A'}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-quikle-charcoal">
                          ${payment.amount.toLocaleString()}
                        </p>
                        {selectedPayment?.id === payment.id && (
                          <CheckCircle className="h-5 w-5 text-quikle-primary" />
                        )}
                      </div>
                      {payment.reference_number && (
                        <p className="text-xs text-quikle-slate mt-1">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReconciliationDualPanel;
