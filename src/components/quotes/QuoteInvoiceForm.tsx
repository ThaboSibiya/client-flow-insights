import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuoteInvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface QuoteInvoiceFormData {
  number: string;
  type: 'quote' | 'invoice';
  customer_name: string;
  customer_email: string;
  customer_id?: string;
  subject: string;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  notes: string;
  terms: string;
  tax: number;
  discount: number;
  items: QuoteInvoiceItem[];
}

interface QuoteInvoiceFormProps {
  quoteInvoice?: any;
  onSave: () => void;
  onCancel: () => void;
}

const QuoteInvoiceForm = ({ quoteInvoice, onSave, onCancel }: QuoteInvoiceFormProps) => {
  const [formData, setFormData] = useState<QuoteInvoiceFormData>({
    number: '',
    type: 'quote',
    customer_name: '',
    customer_email: '',
    subject: '',
    issue_date: new Date().toISOString().split('T')[0],
    notes: '',
    terms: '',
    tax: 0,
    discount: 0,
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });
  
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
    if (quoteInvoice) {
      populateForm();
    } else {
      generateNumber();
    }
  }, [quoteInvoice]);

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
      const { data, error } = await supabase
        .from('quotes_invoices')
        .select('number')
        .like('number', `${formData.type.toUpperCase()}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].number;
        const numPart = parseInt(lastNumber.replace(/[A-Z]/g, ''));
        nextNumber = numPart + 1;
      }

      const prefix = formData.type === 'quote' ? 'QUO' : 'INV';
      setFormData(prev => ({
        ...prev,
        number: `${prefix}${nextNumber.toString().padStart(4, '0')}`
      }));
    } catch (error) {
      console.error('Error generating number:', error);
    }
  };

  const populateForm = async () => {
    if (!quoteInvoice) return;

    try {
      const { data: items, error } = await supabase
        .from('quote_invoice_items')
        .select('*')
        .eq('quote_invoice_id', quoteInvoice.id);

      if (error) throw error;

      setFormData({
        number: quoteInvoice.number,
        type: quoteInvoice.type,
        customer_name: quoteInvoice.customer_name || '',
        customer_email: quoteInvoice.customer_email || '',
        customer_id: quoteInvoice.customer_id,
        subject: quoteInvoice.subject || '',
        issue_date: quoteInvoice.issue_date?.split('T')[0] || '',
        due_date: quoteInvoice.due_date?.split('T')[0] || '',
        valid_until: quoteInvoice.valid_until?.split('T')[0] || '',
        notes: quoteInvoice.notes || '',
        terms: quoteInvoice.terms || '',
        tax: quoteInvoice.tax || 0,
        discount: quoteInvoice.discount || 0,
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const quoteInvoiceData = {
        number: formData.number,
        type: formData.type,
        customer_id: formData.customer_id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        subject: formData.subject,
        issue_date: formData.issue_date,
        due_date: formData.due_date || null,
        valid_until: formData.valid_until || null,
        notes: formData.notes,
        terms: formData.terms,
        subtotal,
        tax: formData.tax,
        discount: formData.discount,
        total,
        user_id: user.id
      };

      let quoteInvoiceId;

      if (quoteInvoice) {
        const { data, error } = await supabase
          .from('quotes_invoices')
          .update(quoteInvoiceData)
          .eq('id', quoteInvoice.id)
          .select()
          .single();

        if (error) throw error;
        quoteInvoiceId = data.id;

        // Delete existing items
        await supabase
          .from('quote_invoice_items')
          .delete()
          .eq('quote_invoice_id', quoteInvoiceId);
      } else {
        const { data, error } = await supabase
          .from('quotes_invoices')
          .insert(quoteInvoiceData)
          .select()
          .single();

        if (error) throw error;
        quoteInvoiceId = data.id;
      }

      // Insert items
      const itemsData = formData.items.map(item => ({
        quote_invoice_id: quoteInvoiceId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        user_id: user.id
      }));

      const { error: itemsError } = await supabase
        .from('quote_invoice_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `${formData.type} ${quoteInvoice ? 'updated' : 'created'} successfully`
      });

      onSave();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'quote' | 'invoice') => {
              setFormData(prev => ({ ...prev, type: value }));
              generateNumber();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="customer">Customer</Label>
            <Select value={formData.customer_id || ''} onValueChange={selectCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
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

          {formData.type === 'invoice' && (
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          )}

          {formData.type === 'quote' && (
            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="tax">Tax (%)</Label>
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Items
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`quantity-${index}`}>Qty</Label>
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
                  <div className="h-10 flex items-center text-sm font-medium">
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

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="Terms and conditions..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : quoteInvoice ? 'Update' : 'Create'} {formData.type}
        </Button>
      </div>
    </form>
  );
};

export default QuoteInvoiceForm;