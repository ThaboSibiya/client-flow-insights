
import React from 'react';
import { QuoteInvoice } from '@/types/quote';

interface QuotePreviewInfoProps {
  quote: QuoteInvoice;
}

export const QuotePreviewInfo = ({ quote }: QuotePreviewInfoProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-quikle-charcoal mb-2">Bill To:</h3>
          <p className="font-semibold text-quikle-charcoal">{quote.customer_name || 'N/A'}</p>
          <p className="text-quikle-slate">{quote.customer_email || ''}</p>
        </div>
        <div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-quikle-charcoal">
                {quote.type === 'quote' ? 'Quote Date:' : 'Invoice Date:'}
              </span>
              <span className="text-quikle-charcoal">
                {quote.issue_date ? new Date(quote.issue_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-quikle-charcoal">
                {quote.type === 'quote' ? 'Valid Until:' : 'Due Date:'}
              </span>
              <span className="text-quikle-charcoal">
                {quote.type === 'quote' 
                  ? (quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A')
                  : (quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'N/A')
                }
              </span>
            </div>
            {quote.status && (
              <div className="flex justify-between">
                <span className="text-quikle-charcoal">Status:</span>
                <span className={`text-quikle-charcoal capitalize ${
                  quote.status === 'paid' ? 'text-green-600' : 
                  quote.status === 'overdue' ? 'text-red-600' : 
                  'text-quikle-slate'
                }`}>
                  {quote.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {quote.subject && (
        <div className="mb-6">
          <h3 className="font-semibold text-quikle-charcoal mb-2">Subject:</h3>
          <p className="text-quikle-slate">{quote.subject}</p>
        </div>
      )}
    </>
  );
};
