
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import StatusSelector from '@/components/customers/StatusSelector';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomerFormStepProps {
  onComplete: () => void;
}

const CustomerFormStep = ({ onComplete }: CustomerFormStepProps) => {
  const { addCustomer } = useCRM();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    company_address: '',
    status: 'new' as CustomerStatus,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: CustomerStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const customerData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await addCustomer(customerData);
      
      toast({
        title: "Success",
        description: "Your first customer has been added!",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer",
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
          <CheckCircle className="h-6 w-6 text-green-600" />
          Add Your First Customer
        </CardTitle>
        <p className="text-muted-foreground">
          Let's start by adding your first customer to the system.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <StatusSelector
                status={formData.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact_person" className="text-sm font-medium">Contact Person</Label>
            <Input
              id="contact_person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              placeholder="Primary contact person"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Customer address"
            />
          </div>

          <div>
            <Label htmlFor="company_address" className="text-sm font-medium">Company Address</Label>
            <Input
              id="company_address"
              name="company_address"
              value={formData.company_address}
              onChange={handleInputChange}
              placeholder="Company address (if different)"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any notes about this customer..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding Customer...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Customer & Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerFormStep;
