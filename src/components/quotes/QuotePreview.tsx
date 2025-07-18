
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { QuoteInvoice } from '@/types/quote';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { QuotePreviewActions } from './previews/QuotePreviewActions';
import { QuotePreviewHeader } from './previews/QuotePreviewHeader';
import { QuotePreviewInfo } from './previews/QuotePreviewInfo';
import { QuotePreviewItemsTable } from './previews/QuotePreviewItemsTable';
import { QuotePreviewTotals } from './previews/QuotePreviewTotals';
import { QuotePreviewFooter } from './previews/QuotePreviewFooter';

interface QuotePreviewProps {
  quote: QuoteInvoice | null;
}

const QuotePreview = ({ quote }: QuotePreviewProps) => {
  const { profile } = useCompanyProfile();
  
  if (!quote) {
    return null;
  }

  const items = Array.isArray(quote.quote_invoice_items) ? quote.quote_invoice_items : [];

  return (
    <div className="space-y-6">
      <QuotePreviewActions quote={quote} />

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <QuotePreviewHeader quote={quote} profile={profile} />
          <QuotePreviewInfo quote={quote} />
          <QuotePreviewItemsTable items={items} />
          <QuotePreviewTotals quote={quote} />
          <QuotePreviewFooter quote={quote} />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotePreview;
