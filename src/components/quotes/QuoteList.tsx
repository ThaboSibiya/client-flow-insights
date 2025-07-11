import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type QuoteInvoice = Tables<'quotes_invoices'>;

interface QuoteListProps {
  quotes: QuoteInvoice[];
  onSelectQuote: (quote: QuoteInvoice) => void;
  onPreview: () => void;
  onEdit: (quote: QuoteInvoice) => void;
}

const QuoteList = ({ quotes, onSelectQuote, onPreview, onEdit }: QuoteListProps) => {
  const { toast } = useToast();

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote/invoice?')) return;

    try {
      const { error } = await supabase
        .from('quotes_invoices')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote/Invoice deleted successfully",
      });

      // Parent will handle refresh
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Error",
        description: "Failed to delete quote/invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'quote' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-indigo-100 text-indigo-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quotes or invoices yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first quote or invoice
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {quote.subject || `${quote.type.toUpperCase()} #${quote.number}`}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {quote.customer_name || quote.customer_email}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Badge className={getTypeColor(quote.type)}>
                      {quote.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                  <div className="text-right">
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(quote.total)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-1">{formatDate(quote.issue_date)}</span>
                  </div>
                  {quote.due_date && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span className="font-medium">Due:</span>
                      <span className="ml-1">{formatDate(quote.due_date)}</span>
                    </div>
                  )}
                  {quote.valid_until && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span className="font-medium">Valid Until:</span>
                      <span className="ml-1">{formatDate(quote.valid_until)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onEdit(quote)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteQuote(quote.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteList;