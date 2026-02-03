import React, { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, X, User, FileText } from "lucide-react";
import { QuoteInvoice, QuoteInvoiceInsert, QuoteInvoiceType } from '@/types/quote';
import { useDocumentForm } from './useDocumentForm';

interface DocumentFormSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  type: QuoteInvoiceType;
  initialData?: QuoteInvoice | null;
  onSave: (data: QuoteInvoiceInsert) => Promise<void>;
  isSubmitting?: boolean;
}

const DocumentFormSlideOver: React.FC<DocumentFormSlideOverProps> = ({
  isOpen,
  onClose,
  type,
  initialData,
  onSave,
  isSubmitting = false,
}) => {
  const {
    formData,
    items,
    customers,
    handleCustomerSelect,
    updateFormField,
    addItem,
    updateItem,
    removeItem,
    resetForm,
    subtotal,
    discount,
    tax,
    total,
    isValid,
    buildInsertData,
  } = useDocumentForm({ type, initialData });

  // Reset form when slide-over opens with new data
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, initialData, resetForm]);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    const data = buildInsertData();
    await onSave(data);
    onClose();
  };

  const formatCurrency = (amount: number): string => {
    return `R${amount.toFixed(2)}`;
  };

  const isEditing = !!initialData;
  const title = isEditing 
    ? `Edit ${type === 'quote' ? 'Quote' : 'Invoice'}`
    : `Create ${type === 'quote' ? 'Quote' : 'Invoice'}`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {title}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Customer Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Customer</Label>
                  <Select onValueChange={handleCustomerSelect} value={formData.customerId}>
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
                  <Label>{type === 'quote' ? 'Quote' : 'Invoice'} Number</Label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => updateFormField('documentNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => updateFormField('customerName', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => updateFormField('customerEmail', e.target.value)}
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => updateFormField('issueDate', e.target.value)}
                  />
                </div>
                {type === 'quote' ? (
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => updateFormField('validUntil', e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateFormField('dueDate', e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => updateFormField('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      {type === 'quote' && (
                        <>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </>
                      )}
                      {type === 'invoice' && (
                        <>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => updateFormField('subject', e.target.value)}
                  placeholder={`${type === 'quote' ? 'Quote' : 'Invoice'} for services...`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Line Items</CardTitle>
                <Button onClick={addItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:flex gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full sm:w-16"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full sm:w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        value={formatCurrency(item.amount)}
                        readOnly
                        className="w-full sm:w-24 bg-background"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="self-end shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateFormField('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms}
                  onChange={(e) => updateFormField('terms', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Card className="h-fit">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={formData.discountType} 
                      onValueChange={(v) => updateFormField('discountType', v as any)}
                    >
                      <SelectTrigger className="w-16 h-8">
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
                      onChange={(e) => updateFormField('discountValue', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8"
                      min="0"
                    />
                    <span className="font-medium text-destructive">-{formatCurrency(discount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => updateFormField('taxRate', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8"
                      min="0"
                    />
                    <span>%</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocumentFormSlideOver;
