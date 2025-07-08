
import React, { useState } from 'react';
import { Tabs } from "@/components/ui/tabs";
import QuoteInvoiceHeader from "@/components/quotes/QuoteInvoiceHeader";
import QuoteInvoiceTabs from "@/components/quotes/QuoteInvoiceTabs";
import QuoteInvoiceTabContent from "@/components/quotes/QuoteInvoiceTabContent";
import { useFetchQuotes } from '@/hooks/useFetchQuotes';
import { useCreateQuote } from '@/hooks/mutations/useCreateQuote';
import { useUpdateQuote } from '@/hooks/mutations/useUpdateQuote';
import { QuoteInvoiceInsert, QuoteInvoice as QuoteInvoiceType } from '@/types/quote';

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
      <QuoteInvoiceHeader onCreateNew={handleCreateNew} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <QuoteInvoiceTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <QuoteInvoiceTabContent
          activeTab={activeTab}
          quotes={quotes}
          isLoading={isLoading}
          selectedQuote={selectedQuote}
          editingQuote={editingQuote}
          onSelectQuote={setSelectedQuote}
          onPreview={() => setActiveTab('preview')}
          onEdit={handleEdit}
          onSave={handleSave}
        />
      </Tabs>
    </div>
  );
};

export default QuoteInvoice;
