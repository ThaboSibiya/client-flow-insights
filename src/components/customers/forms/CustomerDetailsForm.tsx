
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types/customer';
import StatusSelector from '../StatusSelector';

interface CustomerDetailsFormProps {
  customer?: Customer | null;
  onSave: (customerData: any) => void;
  onCancel: () => void;
}

const CustomerDetailsForm = ({ customer, onSave, onCancel }: CustomerDetailsFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleStatusChange = (status: any) => {
    // Status changes are handled separately
    console.log('Status changed to:', status);
  };

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <div className="bg-gradient-to-r from-broker-primary/10 to-broker-accent/10 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-broker-primary">
              {customer ? customer.name : 'New Customer'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {customer ? customer.email : 'Enter customer details'}
            </p>
          </div>
          {customer && (
            <StatusSelector
              status={customer.status}
              onStatusChange={handleStatusChange}
              customerId={customer.id}
            />
          )}
        </div>
      </div>

      {/* Basic Information */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="bg-gradient-to-r from-broker-primary to-broker-accent">
            {customer ? 'Update Customer' : 'Add Customer'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetailsForm;
