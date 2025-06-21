
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Edit, 
  Send, 
  MoreHorizontal, 
  Download, 
  Copy,
  Zap,
  FileText
} from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { useQuoteEmail } from '@/hooks/useQuoteEmail';
import { useUpdateQuoteStatus } from '@/hooks/mutations/useUpdateQuoteStatus';
import { useRevenueOptimization } from '@/hooks/useRevenueOptimization';
import { toast } from '@/hooks/use-toast';

interface QuoteListProps {
  quotes: QuoteInvoice[];
  onSelectQuote: (quote: QuoteInvoice) => void;
  onPreview: () => void;
  onEdit: (quote: QuoteInvoice) => void;
}

const QuoteList = ({ quotes, onSelectQuote, onPreview, onEdit }: QuoteListProps) => {
  const { sendQuoteEmail, isSending } = useQuoteEmail();
  const { updateQuoteStatus } = useUpdateQuoteStatus();
  const { convertQuoteToInvoice } = useRevenueOptimization();

  const getStatusColor = (status: string, type: string) => {
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

  const handlePreview = (quote: QuoteInvoice) => {
    onSelectQuote(quote);
    onPreview();
  };

  const handleSendEmail = async (quote: QuoteInvoice) => {
    await sendQuoteEmail(quote);
  };

  const handleConvertToInvoice = async (quote: QuoteInvoice) => {
    if (quote.type === 'quote' && quote.status === 'accepted') {
      const invoice = await convertQuoteToInvoice(quote.id);
      if (invoice) {
        toast({
          title: "Quote Converted",
          description: `Quote ${quote.number} has been converted to Invoice ${invoice.number}`,
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Documents Found</h3>
          <p className="text-quikle-slate">Create your first quote or invoice to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-lg text-quikle-charcoal">
                    {quote.number}
                  </h3>
                  <Badge className={getStatusColor(quote.status, quote.type)}>
                    {quote.status}
                  </Badge>
                  <Badge variant="outline" className="text-quikle-primary border-quikle-primary">
                    {quote.type.toUpperCase()}
                  </Badge>
                  {quote.type === 'quote' && quote.status === 'accepted' && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <Zap className="h-3 w-3 mr-1" />
                      Ready to Convert
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-quikle-slate">Customer</p>
                    <p className="font-medium text-quikle-charcoal">{quote.customer_name}</p>
                    {quote.customer_email && (
                      <p className="text-sm text-quikle-slate">{quote.customer_email}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-quikle-slate">
                      {quote.type === 'quote' ? 'Valid Until' : 'Due Date'}
                    </p>
                    <p className="font-medium text-quikle-charcoal">
                      {formatDate(quote.type === 'quote' ? quote.valid_until || '' : quote.due_date || '')}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-quikle-slate">Total Amount</p>
                    <p className="font-bold text-lg text-quikle-primary">
                      {formatCurrency(quote.total)}
                    </p>
                  </div>
                </div>

                {quote.subject && (
                  <p className="text-quikle-slate mb-2">{quote.subject}</p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePreview(quote)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(quote)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {quote.customer_email && (
                    <DropdownMenuItem 
                      onClick={() => handleSendEmail(quote)}
                      disabled={isSending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                  )}
                  {quote.type === 'quote' && quote.status === 'accepted' && (
                    <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}>
                      <Zap className="h-4 w-4 mr-2" />
                      Convert to Invoice
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuoteList;
