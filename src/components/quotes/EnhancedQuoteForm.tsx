
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Calendar, User, Mail, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuoteInvoiceInsert, QuoteInvoice } from '@/types/quote';
import { validateQuoteForm } from '@/utils/quoteValidation';

interface QuoteInvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EnhancedQuoteFormProps {
  onSave: (data: QuoteInvoiceInsert) => Promise<void>;
  initialData?: QuoteInvoice | null;
  type: 'quote' | 'invoice';
}

const EnhancedQuoteForm = ({ onSave, initialData, type }: EnhancedQuoteFormProps) => {
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
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }] as QuoteInvoiceItem[]
  });
  
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

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

  const updateItem = (index: number, field: keyof QuoteInvoiceItem, value: any) => {
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

  const selectCustomer = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: (customer as any).name,
        customer_email: (customer as any).email
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, total } = calculateTotals();
      
      // Validate the form data
      const validation = validateQuoteForm(formData, formData.items);
      if (validation.length > 0) {
        toast({
          title: "Validation Error",
          description: validation.map(v => v.message).join(', '),
          variant: "destructive"
        });
        return;
      }

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

      await onSave(quoteInvoiceData);
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

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal">
            {initialData ? 'Edit' : 'Create'} {type === 'quote' ? 'Quote' : 'Invoice'}
          </h1>
          <p className="text-quikle-slate mt-1">
            {initialData ? 'Update' : 'Create a new'} professional {type}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {type === 'quote' ? 'Quote' : 'Invoice'} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Select Customer</Label>
                <Select value={formData.customer_id} onValueChange={selectCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose existing customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
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
            </CardContent>
          </Card>
        </div>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Line Items
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Service or product description"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`rate-${index}`}>Rate</Label>
                    <Input
                      id={`rate-${index}`}
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Amount</Label>
                    <div className="h-10 flex items-center text-sm font-medium bg-quikle-crystal px-3 rounded-md">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({formData.discount}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.tax}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax and Discount */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="discount">Discount Rate (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for the client..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Payment terms and conditions..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={loading} className="bg-quikle-primary hover:bg-quikle-secondary">
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'} {type === 'quote' ? 'Quote' : 'Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedQuoteForm;
