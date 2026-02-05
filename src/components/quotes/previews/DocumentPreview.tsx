 import React, { forwardRef } from 'react';
 import { QuoteInvoice } from '@/types/quote';
 
 interface CompanyProfile {
   company?: string | null;
   company_address?: string | null;
   company_email?: string | null;
   company_phone?: string | null;
   company_logo_url?: string | null;
 }
 
 interface DocumentPreviewProps {
   quote: QuoteInvoice;
   profile: CompanyProfile | null;
 }
 
 export const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
   ({ quote, profile }, ref) => {
     const items = Array.isArray(quote.quote_invoice_items) ? quote.quote_invoice_items : [];
     const isQuote = quote.type === 'quote';
 
     return (
       <div
         ref={ref}
         id="document-preview"
         className="bg-white text-black p-8 w-full max-w-[210mm] mx-auto"
         style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: '1.5' }}
       >
         {/* Header */}
         <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-200">
           <div>
             <h1 className="text-2xl font-bold text-gray-900 mb-1">
               {isQuote ? 'QUOTE' : 'INVOICE'}
             </h1>
             <p className="text-gray-600 text-sm">{quote.number}</p>
           </div>
           <div className="text-right flex items-start gap-4">
             <div>
               <h2 className="font-semibold text-gray-900">{profile?.company || 'Your Company'}</h2>
               {profile?.company_address && (
                 <p className="text-gray-600 text-xs whitespace-pre-line">{profile.company_address}</p>
               )}
               {profile?.company_email && <p className="text-gray-600 text-xs">{profile.company_email}</p>}
               {profile?.company_phone && <p className="text-gray-600 text-xs">{profile.company_phone}</p>}
             </div>
             {profile?.company_logo_url && (
               <img
                 src={profile.company_logo_url}
                 alt="Logo"
                 className="w-16 h-16 object-contain"
                 crossOrigin="anonymous"
               />
             )}
           </div>
         </div>
 
         {/* Customer & Dates */}
         <div className="grid grid-cols-2 gap-8 mb-6">
           <div>
             <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bill To</p>
             <p className="font-medium text-gray-900">{quote.customer_name || 'N/A'}</p>
             {quote.customer_email && <p className="text-gray-600 text-sm">{quote.customer_email}</p>}
           </div>
           <div className="text-right space-y-1">
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">{isQuote ? 'Quote Date' : 'Invoice Date'}:</span>
               <span className="text-gray-900">
                 {quote.issue_date ? new Date(quote.issue_date).toLocaleDateString() : 'N/A'}
               </span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">{isQuote ? 'Valid Until' : 'Due Date'}:</span>
               <span className="text-gray-900">
                 {isQuote
                   ? quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'
                   : quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'N/A'}
               </span>
             </div>
             {quote.status && (
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Status:</span>
                 <span className={`capitalize font-medium ${
                   quote.status === 'paid' ? 'text-green-600' :
                   quote.status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                 }`}>
                   {quote.status}
                 </span>
               </div>
             )}
           </div>
         </div>
 
         {/* Subject */}
         {quote.subject && (
           <div className="mb-6">
             <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Subject</p>
             <p className="text-gray-900">{quote.subject}</p>
           </div>
         )}
 
         {/* Items Table */}
         <table className="w-full mb-6 text-sm">
           <thead>
             <tr className="border-b-2 border-gray-200">
               <th className="text-left py-2 text-gray-700 font-semibold">Description</th>
               <th className="text-center py-2 text-gray-700 font-semibold w-16">Qty</th>
               <th className="text-right py-2 text-gray-700 font-semibold w-24">Rate</th>
               <th className="text-right py-2 text-gray-700 font-semibold w-24">Amount</th>
             </tr>
           </thead>
           <tbody>
             {items.map((item, index) => (
               <tr key={item.id || index} className="border-b border-gray-100">
                 <td className="py-2 text-gray-900">{item.description || 'N/A'}</td>
                 <td className="py-2 text-center text-gray-700">{item.quantity || 0}</td>
                 <td className="py-2 text-right text-gray-700">R {(item.rate || 0).toFixed(2)}</td>
                 <td className="py-2 text-right text-gray-900 font-medium">
                   R {((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
 
         {/* Totals */}
         <div className="flex justify-end mb-8">
           <div className="w-56 space-y-1 text-sm">
             <div className="flex justify-between">
               <span className="text-gray-600">Subtotal:</span>
               <span className="text-gray-900">R {(quote.subtotal || 0).toFixed(2)}</span>
             </div>
             {(quote.discount || 0) > 0 && (
               <div className="flex justify-between">
                 <span className="text-gray-600">Discount:</span>
                 <span className="text-gray-900">-R {(quote.discount || 0).toFixed(2)}</span>
               </div>
             )}
             <div className="flex justify-between">
               <span className="text-gray-600">VAT (15%):</span>
               <span className="text-gray-900">R {(quote.tax || 0).toFixed(2)}</span>
             </div>
             <div className="flex justify-between border-t border-gray-300 pt-2 font-bold text-base">
               <span className="text-gray-900">Total:</span>
               <span className="text-gray-900">R {(quote.total || 0).toFixed(2)}</span>
             </div>
           </div>
         </div>
 
         {/* Notes & Terms */}
         {(quote.notes || quote.terms) && (
           <div className="border-t border-gray-200 pt-4 space-y-4 text-sm">
             {quote.notes && (
               <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                 <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
               </div>
             )}
             {quote.terms && (
               <div>
                 <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</p>
                 <p className="text-gray-700 whitespace-pre-line text-xs">{quote.terms}</p>
               </div>
             )}
           </div>
         )}
 
         {/* Footer */}
         <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
           Thank you for your business
         </div>
       </div>
     );
   }
 );
 
 DocumentPreview.displayName = 'DocumentPreview';