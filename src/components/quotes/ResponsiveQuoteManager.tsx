
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileQuoteBuilder from './mobile/MobileQuoteBuilder';
import EnhancedQuoteForm from './EnhancedQuoteForm';
import { QuoteInvoiceInsert, QuoteInvoice } from '@/types/quote';

interface ResponsiveQuoteManagerProps {
  onSave: (quote: QuoteInvoiceInsert) => void;
  initialData?: QuoteInvoice | null;
  type: 'quote' | 'invoice';
}

const ResponsiveQuoteManager = ({ onSave, initialData, type }: ResponsiveQuoteManagerProps) => {
  const { shouldUseMobileView } = useMobileDetection();

  const handleDuplicate = (quote: QuoteInvoiceInsert) => {
    // Create a new quote with duplicated data
    onSave(quote);
  };

  if (shouldUseMobileView) {
    return (
      <MobileQuoteBuilder
        onSave={onSave}
        onDuplicate={handleDuplicate}
        initialData={initialData}
        type={type}
      />
    );
  }

  return (
    <EnhancedQuoteForm
      onSave={async (data) => {
        await onSave(data);
      }}
      initialData={initialData}
      type={type}
    />
  );
};

export default ResponsiveQuoteManager;
