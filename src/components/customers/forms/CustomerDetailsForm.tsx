import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Customer, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useCRM } from '@/context/CRMContext';
import { Save } from 'lucide-react';

interface CustomerDetailsFormProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetailsForm = ({ customer, onClose }: CustomerDetailsFormProps) => {
  const { updateCustomer } = useCRM();
  
  const form = useForm({
    defaultValues: {
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      status: customer.status || 'new',
      notes: customer.notes || '',
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
            <Label htmlFor="contact_person" className="text-foreground text-sm">Name</Label>
            <Input
              id="contact_person"
              {...form.register('contact_person')}
              placeholder="Full name"
              className="bg-background text-foreground border-input"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="email@example.com"
              className="bg-background text-foreground border-input"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-foreground text-sm">Phone</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+27 12 345 6789"
              className="bg-background text-foreground border-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-foreground text-sm">Status</Label>
            <Select 
              onValueChange={(value) => form.setValue('status', value as CustomerStatus, { shouldDirty: true })}
              defaultValue={customer.status}
            >
              <SelectTrigger className="bg-background text-foreground border-input">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Customer</SelectItem>
                <SelectItem value="existing">Existing Customer</SelectItem>
                <SelectItem value="pending">Pending Policy</SelectItem>
                <SelectItem value="finalised">Finalised Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Lead Source & Reason (read-only context from Voice AI / webhooks) */}
        {(customer.source || customer.reason) && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lead Intelligence</p>
            {customer.source && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{customer.source}</Badge>
              </div>
            )}
            {customer.reason && (
              <p className="text-sm text-foreground leading-relaxed">{customer.reason}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-foreground text-sm">Notes</Label>
          <Textarea
            id="notes"
            {...form.register('notes')}
            placeholder="Additional notes about the customer"
            className="min-h-[80px] bg-background text-foreground border-input resize-none"
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

export default CustomerDetailsForm;
