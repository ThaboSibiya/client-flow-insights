
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
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { addCustomer as addCustomerService } from '@/services/customerService';
import { ArrowDown, Sparkles } from 'lucide-react';

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
    resetTemplate,
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
      // First create the customer and get the actual customer ID
      const newCustomer = await addCustomerService({
        name: values.name,
        email: values.email,
        phone: values.phone,
        status: values.status as CustomerStatus,
        notes: values.notes || '',
        activeTickets: [],
        ticketCount: 0
      }, user.id);

      if (!newCustomer) {
        throw new Error('Failed to create customer');
      }

      // If a template is selected and we have custom data, save it with the real customer ID
      if (selectedTemplate && Object.keys(customFieldValues).length > 0) {
        const { templateService } = await import('@/services/templateService');
        
        // Apply template to customer
        await templateService.applyTemplateToCustomer(newCustomer.id, selectedTemplate.id, user.id);

        // Save all custom field data with non-empty values
        const savePromises = Object.entries(customFieldValues)
          .filter(([_, value]) => value.trim()) // Only save non-empty values
          .map(([fieldId, value]) => 
            templateService.saveCustomFieldData(newCustomer.id, fieldId, value, user.id)
          );

        await Promise.all(savePromises);

        toast({
          title: "Success",
          description: `${values.name} has been successfully onboarded with ${selectedTemplate.name} template.`,
        });
      } else {
        toast({
          title: "Success",
          description: `${values.name} has been successfully onboarded.`,
        });
      }
      
      // Reset form and template selection
      form.reset();
      resetTemplate();
      
      // Redirect to customers page after successful submission
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    } catch (error: any) {
      console.error('Onboarding error:', error);
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
      {/* Template Selection with Popup Preview */}
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        templateFields={templateFields}
        customFieldValues={customFieldValues}
        onFieldValueChange={updateCustomFieldValue}
        fieldsLoading={templatesLoading}
        loading={templatesLoading}
      />

      {/* Visual Flow Indicator */}
      {selectedTemplate && (
        <div className="flex items-center justify-center animate-bounce">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 rounded-full border border-quikle-primary/20">
            <Sparkles className="h-4 w-4 text-quikle-primary" />
            <span className="text-sm font-medium text-quikle-primary">Ready to add customer information</span>
            <ArrowDown className="h-4 w-4 text-quikle-primary" />
          </div>
        </div>
      )}

      {/* Customer Form */}
      <Card className="bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <CardHeader className="border-b border-quikle-silver/20">
          <CardTitle className="bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            Customer Information
          </CardTitle>
          {selectedTemplate && (
            <p className="text-sm text-quikle-slate">
              Using <span className="font-medium text-quikle-primary">{selectedTemplate.name}</span> template - use the Preview & Edit button above to manage template fields
            </p>
          )}
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
                className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-luxury transform hover:scale-[1.02] transition-all duration-200"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Customer...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Add Customer
                    {selectedTemplate && <span>with {selectedTemplate.name}</span>}
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
