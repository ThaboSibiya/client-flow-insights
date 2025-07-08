
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Send, Clock, Plus, TrendingUp, Settings as SettingsIcon } from "lucide-react";
import QuoteForm from "@/components/quotes/QuoteForm";
import InvoiceForm from "@/components/quotes/InvoiceForm";
import QuotePreview from "@/components/quotes/QuotePreview";
import AutomationSettings from "@/components/quotes/AutomationSettings";
import QuoteList from "@/components/quotes/QuoteList";
import QuoteSettings from "@/components/quotes/QuoteSettings";
import RevenueOptimizationDashboard from "@/components/quotes/revenue/RevenueOptimizationDashboard";
import AutoConversionSettings from "@/components/quotes/revenue/AutoConversionSettings";
import DocumentWorkflowManager from "@/components/quotes/workflow/DocumentWorkflowManager";
import ResponsiveQuoteManager from "@/components/quotes/ResponsiveQuoteManager";
import { useFetchQuotes } from '@/hooks/useFetchQuotes';
import { useCreateQuote } from '@/hooks/mutations/useCreateQuote';
import { useUpdateQuote } from '@/hooks/mutations/useUpdateQuote';
import { QuoteInvoiceInsert, QuoteInvoice as QuoteInvoiceType } from '@/types/quote';
import { Skeleton } from '@/components/ui/skeleton';

const QuoteInvoice = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [selectedQuote, setSelectedQuote] = useState<QuoteInvoiceType | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteInvoiceType | null>(null);

  const { quotes, isLoading } = useFetchQuotes();
  const { createQuoteInvoice } = useCreateQuote();
  const { updateQuoteInvoice } = useUpdateQuote();

  const handleSave = async (data: QuoteInvoiceInsert) => {
    try {
      let savedQuote;
      if (editingQuote) {
        savedQuote = await updateQuoteInvoice({ id: editingQuote.id, quoteData: data });
      } else {
        savedQuote = await createQuoteInvoice(data);
      }
      
      if (savedQuote) {
        setSelectedQuote(savedQuote);
        setEditingQuote(null);
        setActiveTab('preview');
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleEdit = (quote: QuoteInvoiceType) => {
    setEditingQuote(quote);
    setSelectedQuote(quote);
    setActiveTab(quote.type === 'quote' ? 'create-quote' : 'create-invoice');
  };

  const handleCreateNew = (type: 'quote' | 'invoice') => {
    setEditingQuote(null);
    setSelectedQuote(null);
    setActiveTab(type === 'quote' ? 'create-quote' : 'create-invoice');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-quikle-primary/10 via-quikle-accent/8 to-quikle-secondary/10 p-6 rounded-xl border border-quikle-silver/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
              Quotes & Invoices
            </h1>
            <p className="text-quikle-slate text-sm mt-1">
              Create professional quotes and invoices with automated workflow management
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleCreateNew('quote')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
            <Button 
              onClick={() => handleCreateNew('invoice')} 
              variant="outline"
              size="sm"
              className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9 bg-white border border-quikle-silver/20 shadow-sm p-1 h-auto">
          <TabsTrigger 
            value="quotes" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            All Quotes
          </TabsTrigger>
          <TabsTrigger 
            value="create-quote" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            Create Quote
          </TabsTrigger>
          <TabsTrigger 
            value="create-invoice" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            Create Invoice
          </TabsTrigger>
          <TabsTrigger 
            value="workflow" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="automation" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            Automation
          </TabsTrigger>
          <TabsTrigger 
            value="revenue-settings" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
          >
            <SettingsIcon className="h-3 w-3" />
            Rev Settings
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <QuoteList 
              quotes={quotes}
              onSelectQuote={setSelectedQuote} 
              onPreview={() => setActiveTab('preview')}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="create-quote" className="mt-6">
          <ResponsiveQuoteManager 
            onSave={handleSave} 
            initialData={editingQuote?.type === 'quote' ? editingQuote : null}
            type="quote"
          />
        </TabsContent>

        <TabsContent value="create-invoice" className="mt-6">
          <ResponsiveQuoteManager 
            onSave={handleSave} 
            initialData={editingQuote?.type === 'invoice' ? editingQuote : null}
            type="invoice"
          />
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          {selectedQuote ? (
            <DocumentWorkflowManager quote={selectedQuote} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Quote Selected</h3>
                <p className="text-quikle-slate">Select a quote to manage its document workflow</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueOptimizationDashboard />
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <AutomationSettings />
        </TabsContent>

        <TabsContent value="revenue-settings" className="mt-6">
          <AutoConversionSettings />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <QuoteSettings />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {selectedQuote ? (
            <QuotePreview quote={selectedQuote} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Quote Selected</h3>
                <p className="text-quikle-slate">Create a new quote or select an existing one to preview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteInvoice;
