
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

interface PDFOptions {
  includeBranding?: boolean;
  template?: 'professional' | 'simple' | 'modern';
  watermark?: boolean;
}

export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (quote: QuoteInvoice, options: PDFOptions = {}) => {
    setIsGenerating(true);
    
    try {
      // Simulate PDF generation - replace with actual PDF service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple text-based "PDF" for demo purposes
      const content = `
${quote.type.toUpperCase()} ${quote.number}
Customer: ${quote.customer_name}
Date: ${new Date(quote.issue_date).toLocaleDateString()}
Total: R${quote.total.toFixed(2)}
Status: ${quote.status}
      `.trim();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quote.number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} ${quote.number} has been downloaded`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    isGenerating,
  };
};
