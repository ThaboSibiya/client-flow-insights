
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Send, Eye, FileText, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuoteInvoice } from '@/types/quote';

interface QuotePreviewProps {
  quote: QuoteInvoice | null;
}

const QuotePreview = ({ quote }: QuotePreviewProps) => {
  // Safety check - if no quote is provided, return null
  if (!quote) {
    return null;
  }

  // Ensure items array exists and is an array
  const items = Array.isArray(quote.quote_invoice_items) ? quote.quote_invoice_items : [];

  const handleDownloadPDF = () => {
    // This would generate and download a PDF
    toast({
      title: "PDF Generated",
      description: "Your PDF has been generated and downloaded"
    });
  };

  const handleDownloadWord = () => {
    // This would generate and download a Word document
    toast({
      title: "Word Document Generated",
      description: "Your Word document has been generated and downloaded"
    });
  };

  const handleSendEmail = () => {
    // This would open email sending dialog
    toast({
      title: "Email Sent",
      description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} has been sent to ${quote.customer_email || 'customer'}`
    });
  };

  const handleSendWhatsApp = () => {
    // This would send via WhatsApp
    toast({
      title: "WhatsApp Message Sent",
      description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} has been sent via WhatsApp`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quikle-charcoal">
          {quote.type === 'quote' ? 'Quote' : 'Invoice'} Preview
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleDownloadPDF}
            variant="outline" 
            className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button 
            onClick={handleDownloadWord}
            variant="outline" 
            className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
          >
            <FileText className="h-4 w-4" />
            Word
          </Button>
          <Button 
            onClick={handleSendEmail}
            className="flex items-center gap-2 bg-quikle-primary hover:bg-quikle-secondary text-white"
          >
            <Send className="h-4 w-4" />
            Email
          </Button>
          <Button 
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-quikle-primary mb-2">
                {quote.type === 'quote' ? 'QUOTE' : 'INVOICE'}
              </h1>
              <p className="text-quikle-slate">
                {quote.number}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-quikle-charcoal">Your Company</h2>
              <p className="text-quikle-slate">123 Business Street</p>
              <p className="text-quikle-slate">Johannesburg, GP 2000</p>
              <p className="text-quikle-slate">contact@company.co.za</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-quikle-charcoal mb-2">Bill To:</h3>
              <p className="font-semibold text-quikle-charcoal">{quote.customer_name || 'N/A'}</p>
              <p className="text-quikle-slate">{quote.customer_email || ''}</p>
              {/* <p className="text-quikle-slate">{quote.customerPhone}</p> */}
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-quikle-charcoal">
                    {quote.type === 'quote' ? 'Quote Date:' : 'Invoice Date:'}
                  </span>
                  <span className="text-quikle-charcoal">
                    {quote.issue_date ? new Date(quote.issue_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-quikle-charcoal">
                    {quote.type === 'quote' ? 'Valid Until:' : 'Due Date:'}
                  </span>
                  <span className="text-quikle-charcoal">
                    {quote.type === 'quote' 
                      ? (quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A')
                      : (quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'N/A')
                    }
                  </span>
                </div>
                {quote.status && (
                  <div className="flex justify-between">
                    <span className="text-quikle-charcoal">Status:</span>
                    <span className={`text-quikle-charcoal capitalize ${
                      quote.status === 'paid' ? 'text-green-600' : 
                      quote.status === 'overdue' ? 'text-red-600' : 
                      'text-quikle-slate'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject */}
          {quote.subject && (
            <div className="mb-6">
              <h3 className="font-semibold text-quikle-charcoal mb-2">Subject:</h3>
              <p className="text-quikle-slate">{quote.subject}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-quikle-silver">
                  <th className="text-left py-2 text-quikle-charcoal">Description</th>
                  <th className="text-right py-2 text-quikle-charcoal">Qty</th>
                  <th className="text-right py-2 text-quikle-charcoal">Rate</th>
                  <th className="text-right py-2 text-quikle-charcoal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-quikle-silver/30">
                    <td className="py-3 text-quikle-charcoal">{item.description || 'N/A'}</td>
                    <td className="py-3 text-right text-quikle-charcoal">{item.quantity || 0}</td>
                    <td className="py-3 text-right text-quikle-charcoal">R{(item.rate || 0).toFixed(2)}</td>
                    <td className="py-3 text-right text-quikle-charcoal">R{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-quikle-charcoal">Subtotal:</span>
                <span className="text-quikle-charcoal">R{(quote.subtotal || 0).toFixed(2)}</span>
              </div>
              {(quote.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-quikle-charcoal">Discount:</span>
                  <span className="text-quikle-charcoal">-R{(quote.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-quikle-charcoal">VAT:</span>
                <span className="text-quikle-charcoal">R{(quote.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-quikle-silver pt-2 font-semibold">
                <span className="text-quikle-charcoal">Total:</span>
                <span className="text-quikle-primary">R{(quote.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-quikle-charcoal mb-2">Notes:</h3>
              <p className="text-quikle-slate">{quote.notes}</p>
            </div>
          )}

          {/* Terms */}
          {quote.terms && (
            <div>
              <h3 className="font-semibold text-quikle-charcoal mb-2">Terms & Conditions:</h3>
              <p className="text-quikle-slate text-sm">{quote.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotePreview;
