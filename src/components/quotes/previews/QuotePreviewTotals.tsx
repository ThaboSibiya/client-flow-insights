
import React from 'react';
import { QuoteInvoice } from '@/types/quote';

interface QuotePreviewTotalsProps {
  quote: QuoteInvoice;
}

export const QuotePreviewTotals = ({ quote }: QuotePreviewTotalsProps) => {
  return (
    <div className="flex justify-end mb-8">
      <div className="w-64 space-y-2">
        <div className="flex justify-between">
          <span className="text-quikle-charcoal">Subtotal:</span>
          <span className="text-quikle-charcoal">R{(quote.subtotal || 0).toFixed(2)}</span>
        </div>
        {(quote.discount || 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-quikle-charcoal">Discount:</span>
            <span className="text-quikle-charcoal">-R{(quote.discount || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-quikle-charcoal">VAT:</span>
          <span className="text-quikle-charcoal">R{(quote.tax || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-quikle-silver pt-2 font-semibold">
          <span className="text-quikle-charcoal">Total:</span>
          <span className="text-quikle-primary">R{(quote.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
