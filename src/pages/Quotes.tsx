
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2, FileText, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QuoteInvoiceForm from "@/components/quotes/QuoteInvoiceForm";
import QuoteInvoiceView from "@/components/quotes/QuoteInvoiceView";

interface QuoteInvoice {
  id: string;
  number: string;
  type: 'quote' | 'invoice';
  customer_name: string;
  customer_email: string;
  subject: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected';
  total: number;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  created_at: string;
}

const Quotes = () => {
  const [quotes, setQuotes] = useState<QuoteInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'quote' | 'invoice'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteInvoice | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quotes_invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes and invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete items first
      await supabase
        .from('quote_invoice_items')
        .delete()
        .eq('quote_invoice_id', id);

      // Delete quote/invoice
      const { error } = await supabase
        .from('quotes_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully"
      });

      fetchQuotes();
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (id: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('quotes_invoices')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully"
      });

      fetchQuotes();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

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

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setViewMode('edit');
    setIsFormOpen(true);
  };

  const handleEditQuote = (quote: QuoteInvoice) => {
    setSelectedQuote(quote);
    setViewMode('edit');
    setIsFormOpen(true);
  };

  const handleViewQuote = (quote: QuoteInvoice) => {
    setSelectedQuote(quote);
    setViewMode('view');
    setIsViewOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedQuote(null);
    fetchQuotes();
  };

  const handleViewClose = () => {
    setIsViewOpen(false);
    setSelectedQuote(null);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.subject && quote.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || quote.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal">Quotes & Invoices</h1>
          <p className="text-quikle-slate mt-1">Manage your quotes and invoices</p>
        </div>
        <Button onClick={handleAddQuote} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-quikle-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Total Items</p>
                <p className="text-2xl font-bold text-quikle-charcoal">{quotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Quotes</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {quotes.filter(q => q.type === 'quote').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Invoices</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {quotes.filter(q => q.type === 'invoice').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-quikle-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Total Value</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  ${quotes.reduce((sum, q) => sum + (q.total || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
                <Input
                  placeholder="Search by number, customer, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-quikle-silver"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value: 'all' | 'quote' | 'invoice') => setTypeFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quote">Quotes</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-quikle-slate">
                      {quotes.length === 0 ? (
                        <>
                          <FileText className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
                          <p className="mb-2">No quotes or invoices yet</p>
                          <Button onClick={handleAddQuote} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first one
                          </Button>
                        </>
                      ) : (
                        'No items match your search criteria'
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      {quote.number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {quote.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quote.customer_name}</p>
                        <p className="text-sm text-quikle-slate">{quote.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {quote.subject || '-'}
                    </TableCell>
                    <TableCell>
                      <Select value={quote.status} onValueChange={(value) => updateStatus(quote.id, value as 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected')}>
                        <SelectTrigger className="w-28">
                          <Badge className={getStatusColor(quote.status)} variant="secondary">
                            {quote.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          {quote.type === 'invoice' && <SelectItem value="paid">Paid</SelectItem>}
                          {quote.type === 'invoice' && <SelectItem value="overdue">Overdue</SelectItem>}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${quote.total?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {formatDate(quote.issue_date)}
                    </TableCell>
                    <TableCell>
                      {quote.due_date ? formatDate(quote.due_date) : 
                       quote.valid_until ? formatDate(quote.valid_until) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQuote(quote)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuote(quote.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-quikle-charcoal">
              {selectedQuote ? 'Edit' : 'Create New'} {selectedQuote?.type || 'Quote/Invoice'}
            </DialogTitle>
          </DialogHeader>
          <QuoteInvoiceForm
            quoteInvoice={selectedQuote}
            onSave={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-quikle-charcoal">
              View {selectedQuote?.type} #{selectedQuote?.number}
            </DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <QuoteInvoiceView
              quoteInvoice={selectedQuote}
              onEdit={() => {
                setIsViewOpen(false);
                handleEditQuote(selectedQuote);
              }}
              onClose={handleViewClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;
