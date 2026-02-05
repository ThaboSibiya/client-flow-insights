 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Download, FileText, Send, MessageSquare, Loader2 } from 'lucide-react';
 import { toast } from '@/hooks/use-toast';
 import { QuoteInvoice } from '@/types/quote';
 import { useQuoteEmail } from '@/hooks/useQuoteEmail';
 import { exportToPDF, exportToWord, getExportFilename } from '@/services/documentExportService';
 
 interface DocumentPreviewActionsProps {
   quote: QuoteInvoice;
 }
 
 export const DocumentPreviewActions = ({ quote }: DocumentPreviewActionsProps) => {
   const { sendQuoteEmail, isSending } = useQuoteEmail();
   const [isExportingPDF, setIsExportingPDF] = useState(false);
   const [isExportingWord, setIsExportingWord] = useState(false);
 
   const handleDownloadPDF = async () => {
     setIsExportingPDF(true);
     try {
       await exportToPDF('document-preview', {
         filename: getExportFilename(quote, 'pdf'),
       });
       toast({
         title: 'PDF Downloaded',
         description: 'Your document has been saved as PDF.',
       });
     } catch (error) {
       console.error('PDF export failed:', error);
       toast({
         title: 'Export Failed',
         description: error instanceof Error ? error.message : 'Failed to generate PDF.',
         variant: 'destructive',
       });
     } finally {
       setIsExportingPDF(false);
     }
   };
 
   const handleDownloadWord = async () => {
     setIsExportingWord(true);
     try {
       await exportToWord('document-preview', {
         filename: getExportFilename(quote, 'doc'),
       });
       toast({
         title: 'Word Document Downloaded',
         description: 'Your document has been saved as Word file.',
       });
     } catch (error) {
       console.error('Word export failed:', error);
       toast({
         title: 'Export Failed',
         description: error instanceof Error ? error.message : 'Failed to export Word document.',
         variant: 'destructive',
       });
     } finally {
       setIsExportingWord(false);
     }
   };
 
   const handleSendEmail = () => {
     if (quote) {
       sendQuoteEmail(quote);
     }
   };
 
   const handleSendWhatsApp = () => {
     const message = encodeURIComponent(
       `Hi,\n\nPlease find ${quote.type === 'quote' ? 'quote' : 'invoice'} ${quote.number} for R${quote.total.toFixed(2)}.\n\nThank you!`
     );
     window.open(`https://wa.me/?text=${message}`, '_blank');
   };
 
   return (
     <div className="flex flex-wrap items-center gap-2">
       <Button
         onClick={handleDownloadPDF}
         variant="outline"
         size="sm"
         className="gap-2"
         disabled={isExportingPDF}
       >
         {isExportingPDF ? (
           <Loader2 className="h-4 w-4 animate-spin" />
         ) : (
           <Download className="h-4 w-4" />
         )}
         PDF
       </Button>
       <Button
         onClick={handleDownloadWord}
         variant="outline"
         size="sm"
         className="gap-2"
         disabled={isExportingWord}
       >
         {isExportingWord ? (
           <Loader2 className="h-4 w-4 animate-spin" />
         ) : (
           <FileText className="h-4 w-4" />
         )}
         Word
       </Button>
       <Button
         onClick={handleSendEmail}
         size="sm"
         className="gap-2"
         disabled={isSending || !quote.customer_email || quote.status === 'sent' || quote.status === 'paid'}
       >
         {isSending ? (
           <Loader2 className="h-4 w-4 animate-spin" />
         ) : (
           <Send className="h-4 w-4" />
         )}
         Email
       </Button>
       <Button
         onClick={handleSendWhatsApp}
         size="sm"
         variant="outline"
         className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
       >
         <MessageSquare className="h-4 w-4" />
         WhatsApp
       </Button>
     </div>
   );
 };