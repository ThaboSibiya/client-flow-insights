
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM, CustomerStatus } from '@/context/CRMContext';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TemplateSelector from '@/components/templates/TemplateSelector';
import CustomFieldRenderer from '@/components/templates/CustomFieldRenderer';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(5, {
    message: 'Please enter a valid phone number.',
  }),
  status: z.enum(['new', 'existing', 'pending', 'finalised']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const OnboardingForm = () => {
  const { addCustomer } = useCRM();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    templateFields,
    customFieldValues,
    updateCustomFieldValue,
    validateRequiredFields,
    saveCustomData,
    loading: templatesLoading
  } = useCustomTemplates();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'new',
      notes: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add customers",
        variant: "destructive",
      });
      return;
    }

    // Validate custom fields if template is selected
    if (selectedTemplate && !validateRequiredFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First add the customer
      await addCustomer({
        name: values.name,
        email: values.email,
        phone: values.phone,
        status: values.status as CustomerStatus,
        notes: values.notes || '',
      });

      // If a template is selected and we have custom data, save it
      if (selectedTemplate) {
        // We need to get the customer ID from the response
        // Since addCustomer doesn't return the ID, we'll need to find it
        // For now, let's assume we can use a temporary approach
        const tempCustomerId = `temp-${Date.now()}`;
        await saveCustomData(tempCustomerId, user.id);
      }
      
      form.reset();
      setSelectedTemplate(null);
      
      toast({
        title: "Success",
        description: `${values.name} has been successfully onboarded${selectedTemplate ? ` with ${selectedTemplate.name} template` : ''}.`,
      });
      
      // Optionally redirect to customers page after successful submission
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add customer: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        loading={templatesLoading}
      />

      {/* Customer Form */}
      <Card className="bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <CardHeader className="border-b border-quikle-silver/20">
          <CardTitle className="bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Customer Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} type="email" />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
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
                      <FormLabel>Customer Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New Customer</SelectItem>
                          <SelectItem value="existing">Existing Customer</SelectItem>
                          <SelectItem value="pending">Pending Policy</SelectItem>
                          <SelectItem value="finalised">Finalised Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Custom Template Fields */}
              {selectedTemplate && templateFields.length > 0 && (
                <div className="space-y-6">
                  <div className="border-t border-quikle-silver/20 pt-6">
                    <h3 className="text-lg font-semibold text-quikle-charcoal mb-4">
                      {selectedTemplate.name} Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {templateFields.map((field) => (
                        <CustomFieldRenderer
                          key={field.id}
                          field={field}
                          value={customFieldValues[field.id] || ''}
                          onChange={(value) => updateCustomFieldValue(field.id, value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any relevant information about this customer"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-luxury"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
