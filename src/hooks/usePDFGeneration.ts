
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export interface PDFOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  includeAttachments?: boolean;
  watermark?: string;
}

export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (quote: QuoteInvoice, options: PDFOptions = {}) => {
    setIsGenerating(true);
    try {
      // Mock PDF generation - in a real app, this would call a service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock PDF blob
      const pdfContent = `PDF for ${quote.type} ${quote.number}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quote.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `PDF generated for ${quote.type} ${quote.number}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
  };
};
