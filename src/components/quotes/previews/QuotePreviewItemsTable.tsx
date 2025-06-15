
import React from 'react';
import { QuoteInvoiceItem } from '@/types/quote';

interface QuotePreviewItemsTableProps {
  items: QuoteInvoiceItem[];
}

export const QuotePreviewItemsTable = ({ items }: QuotePreviewItemsTableProps) => {
  return (
    <div className="mb-8">
      <table className="w-full border-collapse">
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
    </div>
  );
};
