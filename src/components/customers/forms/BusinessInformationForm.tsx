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
      name: customer.name || '',
      contact_person: customer.contact_person || '',
      company_address: customer.company_address || '',
    },
  });

  const { isDirty } = form.formState;
  
  const onSubmit = (data: any) => {
    updateCustomer(customer.id, data);
    onClose();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-foreground text-sm">Company Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Company name"
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact_person" className="text-foreground text-sm">Contact Person</Label>
            <Input
              id="contact_person"
              {...form.register('contact_person')}
              placeholder="Contact person name"
              className="bg-background text-foreground border-input"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="company_address" className="text-foreground text-sm">Company Address</Label>
          <Input
            id="company_address"
            {...form.register('company_address')}
            placeholder="123 Business Street, City, Province, Postal Code"
            className="bg-background text-foreground border-input"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border sticky bottom-0 bg-background pb-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-foreground border-border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!isDirty}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default BusinessInformationForm;
