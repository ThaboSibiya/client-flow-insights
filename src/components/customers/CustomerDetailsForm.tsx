
import React, { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Check, Save, X } from 'lucide-react';

interface CustomerDetailsFormProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsForm = ({ customer, isOpen, onClose }: CustomerDetailsFormProps) => {
  const { updateCustomer } = useCRM();
  
  const form = useForm<Partial<Customer>>({
    defaultValues: customer || {},
  });
  
  const onSubmit = (data: Partial<Customer>) => {
    if (customer) {
      updateCustomer(customer.id, data);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-broker-primary/10 to-broker-accent/10 p-4 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-broker-primary">Edit Customer Details</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-broker-dark font-medium">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} className="border-gray-300 focus:border-broker-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-broker-dark font-medium">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email address" {...field} className="border-gray-300 focus:border-broker-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-broker-dark font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} className="border-gray-300 focus:border-broker-accent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-broker-dark font-medium">Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-broker-accent">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new" className="text-blue-600">New</SelectItem>
                        <SelectItem value="existing" className="text-green-600">Existing</SelectItem>
                        <SelectItem value="pending" className="text-amber-600">Pending Policy</SelectItem>
                        <SelectItem value="finalised" className="text-purple-600">Finalised Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-broker-dark font-medium">Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about the customer" 
                      className="min-h-[100px] border-gray-300 focus:border-broker-accent" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6 gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-300">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-broker-primary to-broker-accent hover:shadow-md transition-all">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsForm;
