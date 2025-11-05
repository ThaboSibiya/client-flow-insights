import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link2, Sparkles, CheckCircle } from "lucide-react";
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
  const [customerMap, setCustomerMap] = useState<CustomerMap>({});

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
              {unpaidInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-quikle-slate">All invoices are paid</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        onClick={() => setSelectedInvoice(invoice)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedInvoice?.id === invoice.id
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {selectedInvoice?.id === invoice.id && (
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
              {unallocatedPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-quikle-slate">All payments are allocated</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unallocatedPayments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedPayment?.id === payment.id
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {selectedPayment?.id === payment.id && (
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
