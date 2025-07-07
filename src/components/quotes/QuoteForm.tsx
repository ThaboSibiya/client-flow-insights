import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Download, Share2, Calendar } from "lucide-react";
import { useCRM } from '@/context/CRMContext';
import { toast } from "@/hooks/use-toast";
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';
import { useMobilePDF } from '@/hooks/useMobilePDF';
import ResponsiveQuoteManager from './ResponsiveQuoteManager';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface QuoteFormProps {
  onSave: (quote: QuoteInvoiceInsert) => void;
  initialData?: QuoteInvoice | null;
}

const QuoteForm = ({ onSave, initialData }: QuoteFormProps) => {
  const { customers } = useCRM();
  const [formData, setFormData] = useState({
    quoteNumber: `QUO-${Date.now()}`,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subject: '',
    notes: '',
    terms: 'Payment due within 30 days',
    taxRate: 15,
    discountType: 'percentage',
    discountValue: 0
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    if (initialData) {
      const taxBase = initialData.subtotal - initialData.discount;
      const taxRate = taxBase > 0 ? (initialData.tax * 100) / taxBase : 15;

      setFormData({
        quoteNumber: initialData.number,
        customerId: initialData.customer_id || '',
        customerName: initialData.customer_name || '',
        customerEmail: initialData.customer_email || '',
        customerPhone: '', // Not in DB model
        issueDate: new Date(initialData.issue_date).toISOString().split('T')[0],
        validUntil: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        subject: initialData.subject || '',
        notes: initialData.notes || '',
        terms: initialData.terms || 'Payment due within 30 days',
        taxRate: taxRate,
        discountType: 'fixed', // Simplification for editing
        discountValue: initialData.discount || 0,
      });

      setItems(initialData.quote_invoice_items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })));
    } else {
      // Reset form if initialData is not provided (i.e., for new quotes)
      setFormData({
        quoteNumber: `QUO-${Date.now()}`,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subject: '',
        notes: '',
        terms: 'Payment due within 30 days',
        taxRate: 15,
        discountType: 'percentage',
        discountValue: 0,
      });
      setItems([{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]);
    }
  }, [initialData]);

  const { generatePDF, shareQuote, isGenerating, isMobileDevice } = useMobilePDF();

  const handleDownloadPDF = async () => {
    if (!initialData) return;
    
    await generatePDF(initialData, {
      template: 'professional',
      includeBranding: true
    });
  };

  const handleShareQuote = async () => {
    if (!initialData) return;
    
    await shareQuote(initialData, {
      template: 'professional',
      includeBranding: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Mobile PDF Actions - only show on mobile and when editing existing quote */}
      {isMobileDevice && initialData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download'}
              </Button>
              <Button 
                onClick={handleShareQuote} 
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Use Responsive Quote Manager */}
      <ResponsiveQuoteManager
        onSave={onSave}
        initialData={initialData}
        type="quote"
      />
    </div>
  );
};

export default QuoteForm;
