
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator, User, FileText, Settings, Copy } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { QuoteInvoiceInsert } from '@/types/quote';
import { useCRM } from '@/context/CRMContext';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface MobileQuoteBuilderProps {
  onSave: (quote: QuoteInvoiceInsert) => void;
  onDuplicate?: (quote: QuoteInvoiceInsert) => void;
  initialData?: any;
  type: 'quote' | 'invoice';
}

const MobileQuoteBuilder = ({ onSave, onDuplicate, initialData, type }: MobileQuoteBuilderProps) => {
  const { customers } = useCRM();
  const [activeSection, setActiveSection] = useState('customer');
  
  const [formData, setFormData] = useState({
    quoteNumber: `${type.toUpperCase()}-${Date.now()}`,
    customerName: '',
    customerEmail: '',
    subject: '',
    notes: '',
    terms: type === 'quote' ? 'Quote valid for 30 days' : 'Payment due within 30 days',
    taxRate: 15,
    discountValue: 0
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = (subtotal * formData.discountValue) / 100;
    const tax = ((subtotal - discount) * formData.taxRate) / 100;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  }, [items, formData.discountValue, formData.taxRate]);

  const sections = [
    { id: 'customer', label: 'Customer', icon: User },
    { id: 'items', label: 'Items', icon: FileText },
    { id: 'calculations', label: 'Totals', icon: Calculator },
    { id: 'details', label: 'Details', icon: Settings }
  ];

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

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        customerEmail: customer.email
      }));
    }
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and subject",
        variant: "destructive"
      });
      return;
    }

    const quoteToSave: QuoteInvoiceInsert = {
      number: formData.quoteNumber,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      issue_date: new Date().toISOString(),
      valid_until: type === 'quote' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
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

  const handleDuplicate = () => {
    const duplicatedQuote: QuoteInvoiceInsert = {
      number: `${type.toUpperCase()}-${Date.now()}`,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      issue_date: new Date().toISOString(),
      valid_until: type === 'quote' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      subject: `Copy of ${formData.subject}`,
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

    if (onDuplicate) {
      onDuplicate(duplicatedQuote);
    }
    toast({
      title: "Quote Duplicated",
      description: "A copy of this quote has been created"
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Mobile Navigation */}
      <div className="flex overflow-x-auto gap-2 p-2 bg-white rounded-lg border border-quikle-silver/20">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="whitespace-nowrap flex-shrink-0"
            >
              <Icon className="h-4 w-4 mr-2" />
              {section.label}
            </Button>
          );
        })}
      </div>

      {/* Customer Section */}
      {activeSection === 'customer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Quote for services..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Section */}
      {activeSection === 'items' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Items</CardTitle>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-quikle-silver/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-quikle-primary">
                      R{item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Calculations Section */}
      {activeSection === 'calculations' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">R{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                />
                <div className="text-right text-green-600">
                  -R{calculations.discount.toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>VAT %</Label>
                <Input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  max="100"
                />
                <div className="text-right">
                  R{calculations.tax.toFixed(2)}
                </div>
              </div>
              <div className="border-t border-quikle-silver/30 pt-3 flex justify-between text-xl font-bold text-quikle-primary">
                <span>Total:</span>
                <span>R{calculations.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Section */}
      {activeSection === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-quikle-silver/20 p-4 flex gap-2">
        <Button 
          onClick={handleDuplicate} 
          variant="outline" 
          className="flex-1"
          disabled={!formData.customerName || !formData.subject}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button 
          onClick={handleSave} 
          className="flex-1 bg-quikle-primary hover:bg-quikle-secondary"
        >
          Save {type}
        </Button>
      </div>
    </div>
  );
};

export default MobileQuoteBuilder;
