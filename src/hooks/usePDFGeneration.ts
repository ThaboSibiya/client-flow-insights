
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { pdfGenerationService, PDFGenerationOptions } from '@/services/pdfGenerationService';
import { toast } from '@/hooks/use-toast';

export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (quote: QuoteInvoice, options?: PDFGenerationOptions) => {
    setIsGenerating(true);
    try {
      await pdfGenerationService.generatePDF(quote, options);
      toast({
        title: "PDF Generated",
        description: "Your PDF has been generated and is ready for printing or saving.",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHTML = (quote: QuoteInvoice, options?: PDFGenerationOptions) => {
    try {
      pdfGenerationService.downloadHTML(quote, options || {
        includeBranding: true,
        template: 'professional',
        watermark: false
      });
      toast({
        title: "HTML Downloaded",
        description: "HTML version downloaded for preview.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download HTML version.",
        variant: "destructive",
      });
    }
  };

  return {
    generatePDF,
    downloadHTML,
    isGenerating
  };
};
