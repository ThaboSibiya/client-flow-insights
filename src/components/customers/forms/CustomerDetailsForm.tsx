
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import StatusSelector from '../StatusSelector';
import { toast } from '@/hooks/use-toast';

interface CustomerDetailsFormProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetailsForm = ({ customer, onClose }: CustomerDetailsFormProps) => {
  const { updateCustomer } = useCRM();
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    notes: customer.notes || '',
    status: customer.status
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: CustomerStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateCustomer(customer.id, formData);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-quikle-crystal p-6 rounded-xl shadow-luxury">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-quikle-primary font-semibold">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-quikle-primary font-semibold">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-quikle-primary font-semibold">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-quikle-primary font-semibold">Status</Label>
            <StatusSelector
              status={formData.status}
              onChange={handleStatusChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-quikle-primary font-semibold">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-quikle-primary font-semibold">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="shadow-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-quikle-silver/20">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetailsForm;
