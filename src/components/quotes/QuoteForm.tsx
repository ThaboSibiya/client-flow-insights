
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Calendar } from "lucide-react";
import { useCRM } from '@/context/CRMContext';
import { toast } from "@/hooks/use-toast";
import { QuoteInvoiceInsert } from '@/hooks/useQuoteData';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface QuoteFormProps {
  onSave: (quote: QuoteInvoiceInsert) => void;
}

const QuoteForm = ({ onSave }: QuoteFormProps) => {
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

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
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

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * formData.discountValue) / 100;
    }
    return formData.discountValue;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.subject || items.some(item => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const total = subtotal - discount + tax;

    const quoteToSave: QuoteInvoiceInsert = {
      number: formData.quoteNumber,
      customer_id: formData.customerId || null,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      issue_date: new Date(formData.issueDate).toISOString(),
      valid_until: new Date(formData.validUntil).toISOString(),
      subject: formData.subject,
      notes: formData.notes,
      terms: formData.terms,
      subtotal,
      discount,
      tax,
      total,
      type: 'quote',
      status: 'draft',
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    onSave(quoteToSave);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <User className="h-5 w-5 text-quikle-primary" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-quikle-charcoal">Select Customer</Label>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose existing customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNumber" className="text-quikle-charcoal">Quote Number</Label>
              <Input
                id="quoteNumber"
                value={formData.quoteNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                className="border-quikle-silver"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-quikle-charcoal">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className="border-quikle-silver"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-quikle-charcoal">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
                className="border-quikle-silver"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-quikle-charcoal">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+27123456789"
                className="border-quikle-silver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate" className="text-quikle-charcoal">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="border-quikle-silver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil" className="text-quikle-charcoal">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="border-quikle-silver"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-quikle-charcoal">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Quote for services..."
              className="border-quikle-silver"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-quikle-charcoal">Quote Items</CardTitle>
            <Button onClick={addItem} size="sm" className="bg-quikle-primary hover:bg-quikle-secondary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label className="text-quikle-charcoal">Description *</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="border-quikle-silver"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-quikle-charcoal">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    className="border-quikle-silver"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-quikle-charcoal">Rate (R)</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="border-quikle-silver"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-quikle-charcoal">Amount</Label>
                  <Input
                    value={`R${item.amount.toFixed(2)}`}
                    readOnly
                    className="bg-quikle-crystal border-quikle-silver"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-quikle-silver/30 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-quikle-charcoal">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                    className="border-quikle-silver"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms" className="text-quikle-charcoal">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    rows={3}
                    className="border-quikle-silver"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-quikle-crystal p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-quikle-charcoal">Subtotal:</span>
                      <span className="font-semibold text-quikle-charcoal">R{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-quikle-charcoal">Discount:</span>
                      <div className="flex items-center gap-2">
                        <Select value={formData.discountType} onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">R</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                          className="w-20"
                          min="0"
                          step="0.01"
                        />
                        <span className="font-semibold text-quikle-charcoal">-R{calculateDiscount().toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-quikle-charcoal">VAT:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-16"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="text-quikle-charcoal">%</span>
                        <span className="font-semibold text-quikle-charcoal">R{calculateTax().toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-quikle-silver/30 pt-3">
                      <span className="text-lg font-semibold text-quikle-charcoal">Total:</span>
                      <span className="text-lg font-bold text-quikle-primary">R{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal">
          Save as Draft
        </Button>
        <Button onClick={handleSave} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
          Create Quote
        </Button>
      </div>
    </div>
  );
};

export default QuoteForm;
