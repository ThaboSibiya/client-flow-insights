import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Send, Clock, Plus } from "lucide-react";
import QuoteForm from "@/components/quotes/QuoteForm";
import InvoiceForm from "@/components/quotes/InvoiceForm";
import QuotePreview from "@/components/quotes/QuotePreview";
import AutomationSettings from "@/components/quotes/AutomationSettings";
import QuoteList from "@/components/quotes/QuoteList";

const QuoteInvoice = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-8 rounded-xl mb-6 shadow-luxury transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent drop-shadow-sm">
              Quotes & Invoices
            </h1>
            <p className="text-quikle-slate mt-1">
              Create professional quotes and invoices with automated follow-up and multi-format exports
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setActiveTab('create-quote')} 
            >
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
            <Button 
              onClick={() => setActiveTab('create-invoice')} 
              variant="outline"
              className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
            >
              <FileText className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30">
          <TabsTrigger value="quotes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
            All Quotes
          </TabsTrigger>
          <TabsTrigger value="create-quote" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
            Create Quote
          </TabsTrigger>
          <TabsTrigger value="create-invoice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
            Create Invoice
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
            Automation
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="mt-6">
          <QuoteList onSelectQuote={setSelectedQuote} onPreview={() => setActiveTab('preview')} />
        </TabsContent>

        <TabsContent value="create-quote" className="mt-6">
          <QuoteForm onSave={(quote) => {
            setSelectedQuote(quote);
            setActiveTab('preview');
          }} />
        </TabsContent>

        <TabsContent value="create-invoice" className="mt-6">
          <InvoiceForm onSave={(invoice) => {
            setSelectedQuote(invoice);
            setActiveTab('preview');
          }} />
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <AutomationSettings />
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
