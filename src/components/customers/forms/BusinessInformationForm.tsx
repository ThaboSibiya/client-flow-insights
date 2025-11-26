import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useCRM } from '@/context/CRMContext';
import { Save } from 'lucide-react';

interface BusinessInformationFormProps {
  customer: Customer;
  onClose: () => void;
}

const BusinessInformationForm = ({ customer, onClose }: BusinessInformationFormProps) => {
  const { updateCustomer } = useCRM();
  
  const form = useForm({
    defaultValues: {
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      name: customer.name || '',
      company_address: customer.company_address || '',
    },
  });
  
  const onSubmit = (data: any) => {
    updateCustomer(customer.id, data);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-quikle-crystal to-white rounded-lg p-6 border border-quikle-silver/20">
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-4 flex items-center gap-2">
          Business Information
        </h3>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-quikle-charcoal font-medium">Contact Person</Label>
              <Input
                id="contact_person"
                {...form.register('contact_person')}
                placeholder="Contact person name"
                className="border-quikle-silver/50 focus:border-quikle-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-quikle-charcoal font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="contact@company.com"
                className="border-quikle-silver/50 focus:border-quikle-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-quikle-charcoal font-medium">Phone Number</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+27 12 345 6789"
                className="border-quikle-silver/50 focus:border-quikle-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-quikle-charcoal font-medium">Company Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Company name"
                className="border-quikle-silver/50 focus:border-quikle-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_address" className="text-quikle-charcoal font-medium">Company Address</Label>
            <Input
              id="company_address"
              {...form.register('company_address')}
              placeholder="123 Business Street, City, Province, Postal Code"
              className="border-quikle-silver/50 focus:border-quikle-primary"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-quikle-silver/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white hover:shadow-md"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessInformationForm;
