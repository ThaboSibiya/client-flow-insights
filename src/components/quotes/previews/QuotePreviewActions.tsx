
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Send, FileText, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuoteInvoice } from '@/types/quote';
import { useQuoteEmail } from '@/hooks/useQuoteEmail';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';

interface QuotePreviewActionsProps {
  quote: QuoteInvoice;
}

export const QuotePreviewActions = ({ quote }: QuotePreviewActionsProps) => {
  const { sendQuoteEmail, isSending } = useQuoteEmail();
  const { generatePDF, isGenerating } = usePDFGeneration();

  const handleDownloadPDF = () => {
    generatePDF(quote, {
      includeBranding: true,
      template: 'professional',
      watermark: false
    });
  };

  const handleDownloadWord = () => {
    toast({
      title: "Word Document Generated",
      description: "Your Word document has been generated and downloaded"
    });
  };

  const handleSendEmail = () => {
    if (quote) {
      sendQuoteEmail(quote);
    }
  };

  const handleSendWhatsApp = () => {
    toast({
      title: "WhatsApp Message Sent",
      description: `${quote.type === 'quote' ? 'Quote' : 'Invoice'} has been sent via WhatsApp`
    });
  };

  const isEmailDisabled = isSending || !quote || quote.status === 'sent' || quote.status === 'paid' || !quote.customer_email;

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-quikle-charcoal">
        {quote.type === 'quote' ? 'Quote' : 'Invoice'} Preview
      </h2>
      <div className="flex gap-2">
        <Button 
          onClick={handleDownloadPDF}
          variant="outline" 
          className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          PDF
        </Button>
        <Button 
          onClick={handleDownloadWord}
          variant="outline" 
          className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
        >
          <FileText className="h-4 w-4" />
          Word
        </Button>
        <Button 
          onClick={handleSendEmail}
          className="flex items-center gap-2 bg-quikle-primary hover:bg-quikle-secondary text-white"
          disabled={isEmailDisabled}
        >
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSending ? 'Sending...' : 'Email'}
        </Button>
        <Button 
          onClick={handleSendWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageSquare className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
};
