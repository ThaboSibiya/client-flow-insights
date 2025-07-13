
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Mail, Share2, Edit, Printer } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { toast } from "@/hooks/use-toast";
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

interface QuotePreviewProps {
  quote: QuoteInvoice;
}

const QuotePreview = ({ quote }: QuotePreviewProps) => {
  const { profile } = useCompanyProfile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "PDF Generation",
      description: "PDF download functionality coming soon.",
    });
  };

  const handleEmail = () => {
    toast({
      title: "Email Sending",
      description: "Email functionality coming soon.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link",
      description: "Share functionality coming soon.",
    });
  };

  const calculateSubtotal = () => {
    return quote.quote_invoice_items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * (quote.discount || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (quote.tax || 0)) / 100;
  const total = quote.total || (taxableAmount + taxAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:shadow-none">
      {/* Actions Bar */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-quikle-charcoal">
            {quote.type === 'quote' ? 'Quote' : 'Invoice'} Preview
          </h1>
          <Badge className={getStatusColor(quote.status)}>
            {quote.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Document */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              {profile?.company_logo_url && (
                <img 
                  src={profile.company_logo_url} 
                  alt="Company Logo" 
                  className="h-16 mb-4"
                />
              )}
              <h1 className="text-3xl font-bold text-quikle-charcoal">
                {profile?.company || 'Your Company'}
              </h1>
              {profile?.company_address && (
                <div className="text-sm text-quikle-slate whitespace-pre-line">
                  {profile.company_address}
                </div>
              )}
              <div className="text-sm text-quikle-slate">
                {profile?.company_phone && <div>Phone: {profile.company_phone}</div>}
                {profile?.company_email && <div>Email: {profile.company_email}</div>}
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="text-3xl font-bold text-quikle-primary">
                {quote.type === 'quote' ? 'QUOTE' : 'INVOICE'}
              </div>
              <div className="text-xl font-semibold">#{quote.number}</div>
              <div className="text-sm text-quikle-slate">
                <div>Date: {formatDate(quote.issue_date)}</div>
                {quote.due_date && (
                  <div>Due: {formatDate(quote.due_date)}</div>
                )}
                {quote.valid_until && (
                  <div>Valid Until: {formatDate(quote.valid_until)}</div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Bill To:</h3>
              <div className="space-y-1">
                <div className="font-medium">{quote.customer_name}</div>
                <div className="text-quikle-slate">{quote.customer_email}</div>
              </div>
            </div>
            
            {quote.subject && (
              <div>
                <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Subject:</h3>
                <div className="text-quikle-slate">{quote.subject}</div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="border border-quikle-silver rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-quikle-crystal">
                  <tr>
                    <th className="text-left p-4 font-semibold text-quikle-charcoal">Description</th>
                    <th className="text-center p-4 font-semibold text-quikle-charcoal w-20">Qty</th>
                    <th className="text-right p-4 font-semibold text-quikle-charcoal w-24">Rate</th>
                    <th className="text-right p-4 font-semibold text-quikle-charcoal w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_invoice_items?.map((item, index) => (
                    <tr key={index} className="border-t border-quikle-silver">
                      <td className="p-4 text-quikle-charcoal">{item.description}</td>
                      <td className="p-4 text-center text-quikle-slate">{item.quantity}</td>
                      <td className="p-4 text-right text-quikle-slate">{formatCurrency(item.rate)}</td>
                      <td className="p-4 text-right font-medium text-quikle-charcoal">
                        {formatCurrency(item.quantity * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-quikle-slate">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {quote.discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount ({quote.discount}%):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              {quote.tax > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-quikle-slate">Tax ({quote.tax}%):</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between py-2 text-lg font-bold text-quikle-primary">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(quote.notes || quote.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {quote.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Notes:</h3>
                  <div className="text-sm text-quikle-slate whitespace-pre-line">
                    {quote.notes}
                  </div>
                </div>
              )}
              
              {quote.terms && (
                <div>
                  <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Terms & Conditions:</h3>
                  <div className="text-sm text-quikle-slate whitespace-pre-line">
                    {quote.terms}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotePreview;
