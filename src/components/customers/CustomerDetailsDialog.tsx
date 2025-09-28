import React, { useState } from 'react';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X } from 'lucide-react';
import CustomerFileUpload from './CustomerFileUpload';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  const { updateCustomer } = useCRM();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<Partial<Customer>>({
    defaultValues: customer || {},
  });
  
  const onSubmit = async (data: Partial<Customer>) => {
    if (!customer) return;
    
    setIsSaving(true);
    try {
      await updateCustomer(customer.id, data);
      onClose();
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-[700px] bg-white border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-quikle-primary/10 to-quikle-accent/10 p-4 -m-6 mb-2 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-quikle-primary">
            {customer?.name || 'Customer Details'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-quikle-charcoal font-medium">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} className="border-quikle-silver focus:border-quikle-accent" />
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
                        <FormLabel className="text-quikle-charcoal font-medium">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email address" {...field} className="border-quikle-silver focus:border-quikle-accent" />
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
                        <FormLabel className="text-quikle-charcoal font-medium">Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} className="border-quikle-silver focus:border-quikle-accent" />
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
                        <FormLabel className="text-quikle-charcoal font-medium">Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-quikle-silver focus:border-quikle-accent">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new" className="text-quikle-info">New</SelectItem>
                            <SelectItem value="existing" className="text-quikle-success">Existing</SelectItem>
                            <SelectItem value="pending" className="text-quikle-accent">Pending Policy</SelectItem>
                            <SelectItem value="finalised" className="text-quikle-purple">Finalised Sale</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="border-quikle-silver">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="documents">
            {customer && (
              <CustomerFileUpload customerId={customer.id} />
            )}
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose} className="border-quikle-silver">
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
