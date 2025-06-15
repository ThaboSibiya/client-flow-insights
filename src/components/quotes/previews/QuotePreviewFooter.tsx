
import React from 'react';
import { QuoteInvoice } from '@/types/quote';

interface QuotePreviewFooterProps {
  quote: QuoteInvoice;
}

export const QuotePreviewFooter = ({ quote }: QuotePreviewFooterProps) => {
  return (
    <>
      {quote.notes && (
        <div className="mb-6">
          <h3 className="font-semibold text-quikle-charcoal mb-2">Notes:</h3>
          <p className="text-quikle-slate">{quote.notes}</p>
        </div>
      )}

      {quote.terms && (
        <div>
          <h3 className="font-semibold text-quikle-charcoal mb-2">Terms & Conditions:</h3>
          <p className="text-quikle-slate text-sm">{quote.terms}</p>
        </div>
      )}
    </>
  );
};
