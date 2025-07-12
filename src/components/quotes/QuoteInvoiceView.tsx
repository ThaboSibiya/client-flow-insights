import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Edit, Eye, Mail, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuoteInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface QuoteInvoiceViewProps {
  quoteInvoice: any;
  onEdit?: () => void;
  onClose?: () => void;
}

const QuoteInvoiceView = ({ quoteInvoice, onEdit, onClose }: QuoteInvoiceViewProps) => {
  const [items, setItems] = useState<QuoteInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [quoteInvoice.id]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_invoice_items')
        .select('*')
        .eq('quote_invoice_id', quoteInvoice.id)
        .order('created_at');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (quoteInvoice.discount || 0)) / 100;
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    const taxableAmount = subtotal - discountAmount;
    return (taxableAmount * (quoteInvoice.tax || 0)) / 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    toast({
      title: "PDF Download",
      description: "PDF generation feature coming soon"
    });
  };

  const handleSendEmail = () => {
    // This would integrate with an email service
    toast({
      title: "Email",
      description: "Email sending feature coming soon"
    });
  };

  const subtotal = calculateSubtotal();
  const discountAmount = calculateDiscountAmount();
  const taxAmount = calculateTaxAmount();
  const total = quoteInvoice.total || (subtotal - discountAmount + taxAmount);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {quoteInvoice.type === 'quote' ? 'Quote' : 'Invoice'} #{quoteInvoice.number}
            </h1>
            <Badge className={getStatusColor(quoteInvoice.status)}>
              {quoteInvoice.status}
            </Badge>
          </div>
          <p className="text-gray-600">
            {quoteInvoice.type === 'quote' ? 'Quote' : 'Invoice'} created on {formatDate(quoteInvoice.created_at)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(quoteInvoice.number)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy #
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold">{quoteInvoice.customer_name}</p>
                <p className="text-gray-600">{quoteInvoice.customer_email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-gray-600 pb-2 border-b">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 py-2">
                    <div className="col-span-6">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right">
                      ${item.rate.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          {(quoteInvoice.notes || quoteInvoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quoteInvoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{quoteInvoice.notes}</p>
                  </CardContent>
                </Card>
              )}
              
              {quoteInvoice.terms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{quoteInvoice.terms}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {quoteInvoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({quoteInvoice.discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {quoteInvoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({quoteInvoice.tax}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-medium">{formatDate(quoteInvoice.issue_date)}</p>
              </div>
              
              {quoteInvoice.due_date && (
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{formatDate(quoteInvoice.due_date)}</p>
                </div>
              )}
              
              {quoteInvoice.valid_until && (
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-medium">{formatDate(quoteInvoice.valid_until)}</p>
                </div>
              )}
              
              {quoteInvoice.subject && (
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-medium">{quoteInvoice.subject}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuoteInvoiceView;