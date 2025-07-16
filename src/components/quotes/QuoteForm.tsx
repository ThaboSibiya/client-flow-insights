
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/context/CRMContext';
import { toast } from '@/components/ui/use-toast';
import { FileText, DollarSign, Calendar } from 'lucide-react';

interface QuoteFormProps {
  onClose: () => void;
}

const QuoteForm = ({ onClose }: QuoteFormProps) => {
  const { customers } = useCRM();
  const [formData, setFormData] = useState({
    customerId: '',
    subject: '',
    description: '',
    amount: '',
    validUntil: '',
    terms: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would typically create a quote via API
      console.log('Creating quote:', formData);
      
      toast({
        title: "Success",
        description: "Quote created successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Quote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="Enter quote subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter quote description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Valid Until
              </Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              placeholder="Enter terms and conditions"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Quote...' : 'Create Quote'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
