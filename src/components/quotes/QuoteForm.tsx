
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Download, Share2, Calendar } from "lucide-react";
import { useCRMContext } from '@/context/CRMContext';
import { toast } from "@/hooks/use-toast";
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';

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
  type?: 'quote' | 'invoice';
}

const QuoteForm = ({ onSave, initialData, type = 'quote' }: QuoteFormProps) => {
  const { customers } = useCRMContext();
  const [formData, setFormData] = useState({
    quoteNumber: `${type.toUpperCase()}-${Date.now()}`,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: type === 'quote' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
    dueDate: type === 'invoice' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
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
        customerPhone: '',
        issueDate: new Date(initialData.issue_date).toISOString().split('T')[0],
        validUntil: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        dueDate: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
        subject: initialData.subject || '',
        notes: initialData.notes || '',
        terms: initialData.terms || 'Payment due within 30 days',
        taxRate: taxRate,
        discountType: 'fixed',
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || ''
      }));
    }
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discountValue) / 100
      : formData.discountValue;
    const taxableAmount = subtotal - discountAmount;
    const tax = (taxableAmount * formData.taxRate) / 100;
    const total = taxableAmount + tax;

    return { subtotal, discount: discountAmount, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { subtotal, discount, tax, total } = calculateTotals();
    
    const quoteData: QuoteInvoiceInsert = {
      type: type,
      number: formData.quoteNumber,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail || undefined,
      customer_id: formData.customerId || undefined,
      issue_date: formData.issueDate,
      valid_until: type === 'quote' ? formData.validUntil || undefined : undefined,
      due_date: type === 'invoice' ? formData.dueDate || undefined : undefined,
      subject: formData.subject || undefined,
      status: 'draft',
      subtotal,
      discount,
      tax,
      total,
      notes: formData.notes || undefined,
      terms: formData.terms || undefined,
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    onSave(quoteData);
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {type === 'quote' ? 'Quote' : 'Invoice'} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quote/Invoice Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quoteNumber">{type === 'quote' ? 'Quote' : 'Invoice'} Number</Label>
                <Input
                  id="quoteNumber"
                  value={formData.quoteNumber}
                  onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <div className="relative">
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={formData.customerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Items</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>R{totals.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>R{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of the quote/invoice"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit">
                Save {type === 'quote' ? 'Quote' : 'Invoice'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteForm;
