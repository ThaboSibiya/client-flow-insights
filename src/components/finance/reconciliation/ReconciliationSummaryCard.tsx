import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Mail, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Invoice, Payment } from '@/types/financeBackend';

interface ReconciliationSummaryCardProps {
  invoices: Invoice[];
  payments: Payment[];
}

const ReconciliationSummaryCard: React.FC<ReconciliationSummaryCardProps> = ({ 
  invoices, 
  payments 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate totals
  const matchedInvoices = invoices.filter(i => i.status === 'paid');
  const partialInvoices = invoices.filter(i => i.status === 'partial');
  const flaggedInvoices = invoices.filter(i => i.status === 'overdue' || i.status === 'cancelled');
  
  const matchedTotal = matchedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const partialTotal = partialInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const flaggedTotal = flaggedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number', 'Customer ID', 'Amount', 'Status', 'Due Date', 
      'Payment Number', 'Payment Amount', 'Payment Date', 'Payment Method'
    ];
    
    const rows = invoices.map(invoice => {
      const relatedPayment = payments.find(p => p.invoice_id === invoice.id);
      return [
        invoice.invoice_number,
        invoice.customer_id,
        invoice.total_amount.toFixed(2),
        invoice.status,
        invoice.due_date,
        relatedPayment?.payment_number || '',
        relatedPayment?.amount.toFixed(2) || '',
        relatedPayment?.payment_date || '',
        relatedPayment?.payment_method || ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reconciliation-summary-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${invoices.length} invoice records to CSV`,
    });
  };

  const handleEmailSummary = () => {
    // This would typically call an edge function to send email
    toast({
      title: "Email Summary",
      description: "Email summary feature will be available soon",
    });
  };

  const handleViewCustomerFinance = () => {
    navigate('/customer-finance');
  };

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="border-b border-quikle-silver/20">
        <CardTitle className="text-lg">Reconciliation Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Totals */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div>
              <p className="text-sm text-quikle-charcoal/60 font-medium">Matched Invoices</p>
              <p className="text-xl font-bold text-green-700">${matchedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-700">{matchedInvoices.length}</p>
              <p className="text-xs text-quikle-charcoal/50">invoices</p>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div>
              <p className="text-sm text-quikle-charcoal/60 font-medium">Partial Invoices</p>
              <p className="text-xl font-bold text-orange-700">${partialTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-700">{partialInvoices.length}</p>
              <p className="text-xs text-quikle-charcoal/50">invoices</p>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div>
              <p className="text-sm text-quikle-charcoal/60 font-medium">Flagged Invoices</p>
              <p className="text-xl font-bold text-red-700">${flaggedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-700">{flaggedInvoices.length}</p>
              <p className="text-xs text-quikle-charcoal/50">invoices</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-quikle-silver/20">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button 
            onClick={handleEmailSummary}
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </Button>

          <Button 
            onClick={handleViewCustomerFinance}
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            View Customer Finance Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReconciliationSummaryCard;
