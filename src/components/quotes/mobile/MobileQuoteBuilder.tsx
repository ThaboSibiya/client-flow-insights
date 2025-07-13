
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ArrowLeft, ArrowRight, Save, Copy } from "lucide-react";
import { QuoteInvoiceInsert, QuoteInvoice } from '@/types/quote';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MobileQuoteBuilderProps {
  onSave: (data: QuoteInvoiceInsert) => void;
  onDuplicate: (data: QuoteInvoiceInsert) => void;
  initialData?: QuoteInvoice | null;
  type: 'quote' | 'invoice';
}

const MobileQuoteBuilder = ({ onSave, onDuplicate, initialData, type }: MobileQuoteBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    number: '',
    type: type,
    customer_name: '',
    customer_email: '',
    customer_id: '',
    subject: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    valid_until: '',
    notes: '',
    terms: '',
    tax: 0,
    discount: 0,
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: 'Basic Info', icon: '📋' },
    { title: 'Customer', icon: '👤' },
    { title: 'Items', icon: '📦' },
    { title: 'Settings', icon: '⚙️' },
    { title: 'Review', icon: '✅' }
  ];

  useEffect(() => {
    fetchCustomers();
    if (initialData) {
      populateForm();
    } else {
      generateNumber();
    }
  }, [initialData, type]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const generateNumber = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prefix = type === 'quote' ? 'QUO' : 'INV';
      const { data, error } = await supabase
        .from('quotes_invoices')
        .select('number')
        .eq('user_id', user.id)
        .like('number', `${prefix}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].number;
        const numPart = parseInt(lastNumber.replace(/[A-Z]/g, ''));
        nextNumber = numPart + 1;
      }

      setFormData(prev => ({
        ...prev,
        number: `${prefix}${nextNumber.toString().padStart(4, '0')}`
      }));
    } catch (error) {
      console.error('Error generating number:', error);
    }
  };

  const populateForm = async () => {
    if (!initialData) return;

    try {
      const { data: items, error } = await supabase
        .from('quote_invoice_items')
        .select('*')
        .eq('quote_invoice_id', initialData.id);

      if (error) throw error;

      setFormData({
        number: initialData.number,
        type: initialData.type,
        customer_name: initialData.customer_name || '',
        customer_email: initialData.customer_email || '',
        customer_id: initialData.customer_id || '',
        subject: initialData.subject || '',
        issue_date: initialData.issue_date?.split('T')[0] || '',
        due_date: initialData.due_date?.split('T')[0] || '',
        valid_until: initialData.valid_until?.split('T')[0] || '',
        notes: initialData.notes || '',
        terms: initialData.terms || '',
        tax: initialData.tax || 0,
        discount: initialData.discount || 0,
        items: items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate
        })) || [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      });
    } catch (error) {
      console.error('Error populating form:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * formData.tax) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { subtotal, total } = calculateTotals();
      
      const quoteInvoiceData: QuoteInvoiceInsert = {
        number: formData.number,
        type: formData.type,
        customer_id: formData.customer_id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        subject: formData.subject || null,
        status: 'draft',
        issue_date: formData.issue_date,
        due_date: formData.due_date || null,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        terms: formData.terms || null,
        subtotal,
        tax: formData.tax,
        discount: formData.discount,
        total,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate
        }))
      };

      onSave(quoteInvoiceData);
    } catch (error: any) {
      console.error(`Error saving ${formData.type}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to save ${formData.type}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    const { subtotal, total } = calculateTotals();
    
    const duplicateData: QuoteInvoiceInsert = {
      number: `${formData.number}-COPY`,
      type: formData.type,
      customer_id: formData.customer_id || null,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      subject: formData.subject ? `${formData.subject} (Copy)` : null,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: formData.due_date || null,
      valid_until: formData.valid_until || null,
      notes: formData.notes || null,
      terms: formData.terms || null,
      subtotal,
      tax: formData.tax,
      discount: formData.discount,
      total,
      items: formData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    onDuplicate(duplicateData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div>
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                required
              />
            </div>
            {type === 'invoice' && (
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            )}
            {type === 'quote' && (
              <div>
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            )}
          </div>
        );

      case 1: // Customer
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Select Customer</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => {
                  const customer = customers.find((c: any) => c.id === value);
                  if (customer) {
                    setFormData(prev => ({
                      ...prev,
                      customer_id: value,
                      customer_name: (customer as any).name,
                      customer_email: (customer as any).email
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose existing customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                required
              />
            </div>
          </div>
        );

      case 2: // Items
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            {formData.items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Service or product"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Amount: ${item.amount.toFixed(2)}</span>
                    {formData.items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 3: // Settings
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax">Tax Rate (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Payment terms..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4: // Review
        const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
        return (
          <div className="space-y-4">
            <div className="p-4 bg-quikle-crystal rounded-lg">
              <h3 className="font-semibold mb-2">{type === 'quote' ? 'Quote' : 'Invoice'} Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Number:</span>
                  <span>{formData.number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{formData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{formData.items.length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Totals</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {formData.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex-1 bg-quikle-primary hover:bg-quikle-secondary"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
              {initialData && (
                <Button 
                  onClick={handleDuplicate}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-xs ${
              index === currentStep
                ? 'text-quikle-primary font-semibold'
                : index < currentStep
                ? 'text-green-600'
                : 'text-quikle-slate'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1 ${
                index === currentStep
                  ? 'bg-quikle-primary text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-quikle-silver text-quikle-slate'
              }`}
            >
              {step.icon}
            </div>
            <span>{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={previousStep}
          disabled={currentStep === 0}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default MobileQuoteBuilder;
