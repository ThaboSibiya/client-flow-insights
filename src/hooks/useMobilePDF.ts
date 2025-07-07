
import { useState } from 'react';
import { QuoteInvoice } from '@/types/quote';
import { mobilePDFService, MobilePDFOptions } from '@/services/mobilePDFService';
import { useMobileDetection } from './useMobileDetection';

export const useMobilePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { isMobile, isTouchDevice } = useMobileDetection();

  const generatePDF = async (quote: QuoteInvoice, options?: MobilePDFOptions) => {
    setIsGenerating(true);
    try {
      if (isMobile || isTouchDevice) {
        await mobilePDFService.generateMobilePDF(quote, options);
      } else {
        // Fallback to regular PDF generation for desktop
        await mobilePDFService.generateMobilePDF(quote, options);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const shareQuote = async (quote: QuoteInvoice, options?: MobilePDFOptions) => {
    setIsGenerating(true);
    try {
      await mobilePDFService.shareQuote(quote, options || {
        template: 'professional',
        includeBranding: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePDF,
    shareQuote,
    isGenerating,
    isMobileDevice: isMobile || isTouchDevice
  };
};
