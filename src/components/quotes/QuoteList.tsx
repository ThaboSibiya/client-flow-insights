
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, FileText, DollarSign } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';

interface QuoteListProps {
  quotes: QuoteInvoice[];
  onSelectQuote: (quote: QuoteInvoice) => void;
  onPreview: () => void;
  onEdit: (quote: QuoteInvoice) => void;
}

const QuoteList = ({ quotes, onSelectQuote, onPreview, onEdit }: QuoteListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Quotes or Invoices Yet</h3>
          <p className="text-quikle-slate">Create your first quote or invoice to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {quotes.map((quote) => (
        <Card key={quote.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {quote.type === 'quote' ? (
                      <FileText className="h-5 w-5 text-quikle-primary" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-green-500" />
                    )}
                    <h3 className="font-semibold text-quikle-charcoal">
                      {quote.number}
                    </h3>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {quote.type}
                  </Badge>
                  <Badge className={getStatusColor(quote.status)} variant="secondary">
                    {quote.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-quikle-slate">Customer:</span>
                    <p className="font-medium">{quote.customer_name}</p>
                    <p className="text-quikle-slate text-xs">{quote.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-quikle-slate">Subject:</span>
                    <p className="font-medium">{quote.subject || 'No subject'}</p>
                  </div>
                  <div>
                    <span className="text-quikle-slate">Amount:</span>
                    <p className="font-medium text-lg">${quote.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-3 text-xs text-quikle-slate">
                  <span>Created: {formatDate(quote.created_at)}</span>
                  {quote.due_date && <span>Due: {formatDate(quote.due_date)}</span>}
                  {quote.valid_until && <span>Valid until: {formatDate(quote.valid_until)}</span>}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectQuote(quote);
                    onPreview();
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(quote)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuoteList;
