import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Download, Send, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuoteInvoice } from '@/types/quote';

interface QuoteListProps {
  quotes: QuoteInvoice[];
  onSelectQuote: (quote: QuoteInvoice) => void;
  onPreview: () => void;
  onEdit: (quote: QuoteInvoice) => void;
}

const QuoteList = ({ quotes, onSelectQuote, onPreview, onEdit }: QuoteListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = (quote.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quote.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesType = typeFilter === 'all' || quote.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewQuote = (quote: QuoteInvoice) => {
    onSelectQuote(quote);
    onPreview();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Filter className="h-5 w-5 text-quikle-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-quikle-slate" />
              <Input
                placeholder="Search quotes/invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-quikle-silver"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quote">Quotes Only</SelectItem>
                <SelectItem value="invoice">Invoices Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes/Invoices List */}
      <div className="grid gap-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-quikle-charcoal">{quote.number}</h3>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                    <Badge variant="outline" className="border-quikle-silver text-quikle-charcoal">
                      {quote.type}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-quikle-charcoal mb-1">{quote.customer_name}</p>
                  <p className="text-quikle-slate mb-2">{quote.subject}</p>
                  <div className="flex items-center gap-4 text-sm text-quikle-slate">
                    <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                    <span>
                      {quote.type === 'quote' ? 'Valid Until' : 'Due Date'}: 
                      {quote.type === 'quote' 
                        ? (quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A')
                        : (quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'N/A')
                      }
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-quikle-primary mb-4">
                    ${quote.total.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewQuote(quote)}
                      className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(quote)}
                      className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-quikle-primary hover:bg-quikle-secondary text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-quikle-slate">No quotes or invoices found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteList;
