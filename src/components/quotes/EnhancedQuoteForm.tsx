import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, FileText, Eye, BookOpen, Calculator } from "lucide-react";
import { useCRM } from '@/context/CRMContext';
import { toast } from "@/hooks/use-toast";
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';
import { validateQuoteForm, validateCalculations, ValidationError } from '@/utils/quoteValidation';
import LiveQuotePreview from './LiveQuotePreview';
import TemplateLibrary from './TemplateLibrary';
import ValidationFeedback from './ValidationFeedback';
import QuoteForm from './QuoteForm';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EnhancedQuoteFormProps {
  onSave: (quote: QuoteInvoiceInsert) => void;
  initialData?: QuoteInvoice | null;
  type: 'quote' | 'invoice';
}

const EnhancedQuoteForm = ({ onSave, initialData, type }: EnhancedQuoteFormProps) => {
  const { customers } = useCRM();
  const [activeTab, setActiveTab] = useState('form');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [dismissedWarnings, setDismissedWarnings] = useState<number[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    quoteNumber: `${type.toUpperCase()}-${Date.now()}`,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: type === 'quote' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
    subject: '',
    notes: '',
    terms: type === 'quote' ? 'Quote valid for 30 days' : 'Payment due within 30 days',
    taxRate: 15,
    discountType: 'percentage' as const,
    discountValue: 0
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Initialize form data from initialData
  useEffect(() => {
    if (initialData) {
      const taxBase = initialData.subtotal - initialData.discount;
      const taxRate = taxBase > 0 ? (initialData.tax * 100) / taxBase : 15;

      setFormData({
        quoteNumber: initialData.number,
        customerName: initialData.customer_name || '',
        customerEmail: initialData.customer_email || '',
        customerPhone: '',
        issueDate: new Date(initialData.issue_date).toISOString().split('T')[0],
        validUntil: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        subject: initialData.subject || '',
        notes: initialData.notes || '',
        terms: initialData.terms || 'Payment due within 30 days',
        taxRate: taxRate,
        discountType: 'percentage',
        discountValue: initialData.discount || 0,
      });

      setItems(initialData.quote_invoice_items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })));
    }
  }, [initialData]);

  // Real-time calculations
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discountValue) / 100 
      : formData.discountValue;
    const tax = ((subtotal - discount) * formData.taxRate) / 100;
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  }, [items, formData.discountType, formData.discountValue, formData.taxRate]);

  // Real-time validation
  useEffect(() => {
    const formErrors = validateQuoteForm(formData, items);
    const calcErrors = validateCalculations(
      calculations.subtotal,
      calculations.discount,
      calculations.tax,
      calculations.total
    );
    
    const allErrors = [...formErrors, ...calcErrors];
    const filteredErrors = allErrors.filter((_, index) => !dismissedWarnings.includes(index));
    setValidationErrors(filteredErrors);
  }, [formData, items, calculations, dismissedWarnings]);

  const handleTemplateSelect = (template: any) => {
    // Apply template to form
    setItems(template.preview.items.map((item: any, index: number) => ({
      id: (index + 1).toString(),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate
    })));

    setFormData(prev => ({
      ...prev,
      taxRate: template.preview.taxRate,
      terms: template.preview.terms,
      notes: template.preview.notes
    }));

    setShowTemplateDialog(false);
    setActiveTab('form');
  };

  const handleSave = () => {
    const hasErrors = validationErrors.some(error => error.type === 'error');
    
    if (hasErrors) {
      toast({
        title: "Validation Errors",
        description: "Please fix all errors before saving.",
        variant: "destructive"
      });
      return;
    }

    const quoteToSave: QuoteInvoiceInsert = {
      number: formData.quoteNumber,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      issue_date: new Date(formData.issueDate).toISOString(),
      valid_until: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
      subject: formData.subject,
      notes: formData.notes,
      terms: formData.terms,
      subtotal: calculations.subtotal,
      discount: calculations.discount,
      tax: calculations.tax,
      total: calculations.total,
      type: type,
      status: 'draft',
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    onSave(quoteToSave);
  };

  const handleDismissWarning = (index: number) => {
    setDismissedWarnings(prev => [...prev, index]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">
            {initialData ? `Edit ${type}` : `Create New ${type}`}
          </h2>
          <p className="text-quikle-slate">
            {type === 'quote' ? 'Create a professional quote with real-time preview' : 'Generate an invoice with automated calculations'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Choose a Template</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <TemplateLibrary onSelectTemplate={handleTemplateSelect} type={type} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Validation Feedback */}
      <ValidationFeedback 
        errors={validationErrors}
        onDismissError={handleDismissWarning}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white border border-quikle-silver/20">
          <TabsTrigger 
            value="form" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Form
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger 
            value="calculations" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <QuoteForm 
            onSave={onSave} 
            initialData={initialData} 
            type={type}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <LiveQuotePreview
            formData={formData}
            items={items}
            type={type}
          />
        </TabsContent>

        <TabsContent value="calculations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculation Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-quikle-charcoal">Items Summary</h4>
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-quikle-crystal p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {item.description || `Item ${index + 1}`}
                        </span>
                        <span className="text-sm font-semibold">
                          R{item.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-quikle-slate">
                        {item.quantity} × R{item.rate.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-quikle-charcoal">Final Calculations</h4>
                  <div className="bg-white border border-quikle-silver/30 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">R{calculations.subtotal.toFixed(2)}</span>
                    </div>
                    {calculations.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Fixed'}):
                        </span>
                        <span>-R{calculations.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>VAT ({formData.taxRate}%):</span>
                      <span className="font-medium">R{calculations.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-quikle-silver/30 pt-3 flex justify-between text-lg font-bold text-quikle-primary">
                      <span>Total:</span>
                      <span>R{calculations.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-quikle-silver/20">
        <Button variant="outline">
          Save as Draft
        </Button>
        <Button 
          onClick={handleSave}
          disabled={validationErrors.some(error => error.type === 'error')}
          className="bg-quikle-primary hover:bg-quikle-secondary text-white"
        >
          {initialData ? `Update ${type}` : `Create ${type}`}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedQuoteForm;
