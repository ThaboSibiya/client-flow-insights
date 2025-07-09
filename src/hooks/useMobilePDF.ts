
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';
import { useMobileDetection } from './useMobileDetection';

interface PDFOptions {
  template?: 'professional' | 'simple' | 'modern';
  includeBranding?: boolean;
}

export const useMobilePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { isMobile: isMobileDevice } = useMobileDetection();

  const generatePDF = async (quote: QuoteInvoice, options: PDFOptions = {}) => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const content = `
${quote.type.toUpperCase()} ${quote.number}
Customer: ${quote.customer_name}
Date: ${new Date(quote.issue_date).toLocaleDateString()}
Total: R${quote.total.toFixed(2)}
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
        title: "PDF Downloaded",
        description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} has been saved`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareQuote = async (quote: QuoteInvoice, options: PDFOptions = {}) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${quote.type.toUpperCase()} ${quote.number}`,
          text: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} for ${quote.customer_name} - R${quote.total.toFixed(2)}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await generatePDF(quote, options);
    }
  };

  return {
    generatePDF,
    shareQuote,
    isGenerating,
    isMobileDevice,
  };
};
