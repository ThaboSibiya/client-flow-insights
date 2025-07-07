
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, MapPin, FileText } from "lucide-react";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface LiveQuotePreviewProps {
  formData: {
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    issueDate: string;
    validUntil: string;
    subject: string;
    notes: string;
    terms: string;
    taxRate: number;
    discountValue: number;
    discountType: string;
  };
  items: QuoteItem[];
  type: 'quote' | 'invoice';
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const LiveQuotePreview = ({ formData, items, type, companyInfo }: LiveQuotePreviewProps) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * (formData.discountValue || 0)) / 100;
    }
    return formData.discountValue || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * (formData.taxRate || 0)) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const defaultCompany = {
    name: "Your Company Name",
    address: "123 Business Street, City, Country",
    phone: "+27 123 456 789",
    email: "info@yourcompany.com"
  };

  const company = companyInfo || defaultCompany;

  return (
    <Card className="bg-white shadow-lg border border-quikle-silver/20">
      <CardHeader className="border-b border-quikle-silver/20 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-quikle-primary" />
              <h2 className="text-xl font-bold text-quikle-charcoal">{company.name}</h2>
            </div>
            <div className="text-sm text-quikle-slate space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{company.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{company.email}</span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
              {type === 'quote' ? 'QUOTE' : 'INVOICE'}
            </Badge>
            <div className="text-sm text-quikle-slate">
              <div>#{formData.quoteNumber || `${type.toUpperCase()}-${Date.now()}`}</div>
              <div>Date: {formData.issueDate || new Date().toLocaleDateString()}</div>
              {type === 'quote' && (
                <div>Valid Until: {formData.validUntil || 'Not specified'}</div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-quikle-charcoal flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bill To:
          </h3>
          <div className="bg-quikle-crystal p-4 rounded-lg space-y-1">
            <div className="font-medium">{formData.customerName || 'Customer Name'}</div>
            {formData.customerEmail && (
              <div className="text-sm text-quikle-slate">{formData.customerEmail}</div>
            )}
            {formData.customerPhone && (
              <div className="text-sm text-quikle-slate">{formData.customerPhone}</div>
            )}
          </div>
        </div>

        {/* Subject */}
        {formData.subject && (
          <div className="space-y-2">
            <h3 className="font-semibold text-quikle-charcoal">Subject:</h3>
            <div className="text-quikle-slate">{formData.subject}</div>
          </div>
        )}

        {/* Items Table */}
        <div className="space-y-4">
          <h3 className="font-semibold text-quikle-charcoal">Items:</h3>
          <div className="border border-quikle-silver/30 rounded-lg overflow-hidden">
            <div className="bg-quikle-crystal p-3 border-b border-quikle-silver/30">
              <div className="grid grid-cols-12 gap-2 font-medium text-sm text-quikle-charcoal">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
            </div>
            <div className="divide-y divide-quikle-silver/20">
              {items.length > 0 ? items.map((item, index) => (
                <div key={item.id} className="p-3">
                  <div className="grid grid-cols-12 gap-2 text-sm">
                    <div className="col-span-6">
                      {item.description || `Item ${index + 1}`}
                    </div>
                    <div className="col-span-2 text-center">{item.quantity || 0}</div>
                    <div className="col-span-2 text-right">R{(item.rate || 0).toFixed(2)}</div>
                    <div className="col-span-2 text-right font-medium">
                      R{(item.amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-quikle-slate">
                  No items added yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between">
                <span className="text-quikle-charcoal">Subtotal:</span>
                <span className="font-semibold">R{calculateSubtotal().toFixed(2)}</span>
              </div>
              {calculateDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Fixed'}):
                  </span>
                  <span>-R{calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-quikle-charcoal">VAT ({formData.taxRate || 0}%):</span>
                <span className="font-semibold">R{calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-quikle-primary">
                <span>Total:</span>
                <span>R{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(formData.notes || formData.terms) && (
          <div className="space-y-4">
            <Separator />
            {formData.notes && (
              <div className="space-y-2">
                <h3 className="font-semibold text-quikle-charcoal">Notes:</h3>
                <div className="text-sm text-quikle-slate bg-quikle-crystal p-3 rounded">
                  {formData.notes}
                </div>
              </div>
            )}
            {formData.terms && (
              <div className="space-y-2">
                <h3 className="font-semibold text-quikle-charcoal">Terms & Conditions:</h3>
                <div className="text-sm text-quikle-slate bg-quikle-crystal p-3 rounded">
                  {formData.terms}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveQuotePreview;
