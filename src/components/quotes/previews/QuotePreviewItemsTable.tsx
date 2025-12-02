
import React from 'react';
import { QuoteInvoiceItem } from '@/types/quote';

interface QuotePreviewItemsTableProps {
  items: QuoteInvoiceItem[];
}

export const QuotePreviewItemsTable = ({ items }: QuotePreviewItemsTableProps) => {
  return (
    <div className="mb-8">
      {/* Desktop table */}
      <table className="w-full border-collapse hidden md:table">
        <thead>
          <tr className="border-b border-quikle-silver">
            <th className="text-left py-2 text-quikle-charcoal">Description</th>
            <th className="text-right py-2 text-quikle-charcoal">Qty</th>
            <th className="text-right py-2 text-quikle-charcoal">Rate</th>
            <th className="text-right py-2 text-quikle-charcoal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-quikle-silver/30">
              <td className="py-3 text-quikle-charcoal">{item.description || 'N/A'}</td>
              <td className="py-3 text-right text-quikle-charcoal">{item.quantity || 0}</td>
              <td className="py-3 text-right text-quikle-charcoal">R{(item.rate || 0).toFixed(2)}</td>
              <td className="py-3 text-right text-quikle-charcoal">R{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border border-quikle-silver/30 rounded-lg p-3 space-y-2">
            <p className="text-quikle-charcoal font-medium text-sm">{item.description || 'N/A'}</p>
            <div className="flex justify-between text-xs text-quikle-charcoal">
              <span>Qty: {item.quantity || 0}</span>
              <span>Rate: R{(item.rate || 0).toFixed(2)}</span>
              <span className="font-semibold">R{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
