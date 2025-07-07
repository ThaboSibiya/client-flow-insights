import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import OnboardingProgress from './OnboardingProgress';
import { sanitizeTextInput } from '@/utils/onboardingValidation';
import { createCustomerWithEquipment } from '@/services/customerService';

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface CustomerTemplate {
  id: string;
  industry: string;
  template_name: string;
  field_definitions: {
    fields: FieldDefinition[];
  };
}

interface CustomerFormStepProps {
  industry: string;
  onComplete: () => void;
  onBack: () => void;
}

const CustomerFormStep: React.FC<CustomerFormStepProps> = ({
  industry,
  onComplete,
  onBack,
}) => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<CustomerTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent multiple analytics tracking calls
  const hasTrackedTemplate = useRef(false);

  const onboardingSteps = [
    { title: 'Company Info', description: 'Business details' },
    { title: 'First Customer', description: 'Add initial customer' },
    { title: 'Complete', description: 'Setup finished' }
  ];

  const form = useForm<Record<string, any>>({
    defaultValues: {},
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!industry) {
        setError('No industry specified');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('industry_customer_templates')
          .select('*')
          .eq('industry', industry)
          .single();

        if (fetchError) {
          console.error('Error fetching template:', fetchError);
          setError('Failed to load customer template');
          setTemplate(null);
        } else if (data) {
          const parsedData = {
            ...data,
            field_definitions: typeof data.field_definitions === 'string' 
              ? JSON.parse(data.field_definitions) 
              : data.field_definitions
          };
          setTemplate(parsedData);

          // Track template loading only once
          if (!hasTrackedTemplate.current) {
            console.log('Template loaded:', parsedData.template_name);
            hasTrackedTemplate.current = true;
          }

          // Set default values for the form
          const defaultValues: Record<string, any> = {};
          parsedData.field_definitions.fields.forEach((field: FieldDefinition) => {
            defaultValues[field.name] = '';
          });
          form.reset(defaultValues);
        }
      } catch (err) {
        console.error('Error in fetchTemplate:', err);
        setError('Failed to load customer template');
        setTemplate(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [industry, form]);

  const parseCustomerData = (formData: Record<string, any>) => {
    // Extract standard customer fields
    const customerName = formData.company_name || 
                        formData.client_name || 
                        formData.name || 
                        formData.business_name ||
                        'New Customer';

    const customerData = {
      name: customerName,
      email: formData.email || formData.contact_email || '',
      phone: formData.phone_number || formData.phone || formData.contact_phone || '',
      address: formData.address || '',
      contact_person: formData.contact_person || '',
      company_address: formData.company_address || formData.address || '',
      status: 'new' as const,
      notes: `Industry: ${industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}\nTemplate: ${template?.template_name || 'Unknown'}`,
      activeTickets: [],
      ticketCount: 0,
    };

    // Extract equipment data if present
    const equipmentData = {
      equipment_type: formData.printer_brand ? 'printer' : 'other',
      brand: formData.printer_brand || formData.equipment_brand || '',
      model: formData.printer_model || formData.equipment_model || '',
      serial_number: formData.serial_number || '',
      purchase_date: formData.purchase_date ? new Date(formData.purchase_date) : undefined,
      warranty_expiry: formData.warranty_expiry ? new Date(formData.warranty_expiry) : undefined,
      notes: formData.equipment_notes || '',
    };

    // Only include equipment if we have meaningful data
    const hasEquipmentData = equipmentData.brand || equipmentData.model || equipmentData.serial_number;

    return {
      customerData,
      equipmentData: hasEquipmentData ? equipmentData : undefined,
    };
  };

  const onSubmit = async (data: Record<string, any>) => {
    if (!user || !template) {
      toast({
        title: 'Error',
        description: 'Missing user or template data',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting customer creation with data:', data);
      
      // Sanitize all text inputs
      const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = sanitizeTextInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const { customerData, equipmentData } = parseCustomerData(sanitizedData);

      console.log('Creating customer with structured data:', { customerData, equipmentData });

      const customer = await createCustomerWithEquipment(
        customerData,
        user.id,
        equipmentData
      );

      console.log('Customer created successfully:', customer);

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Onboarding marked as complete');

      // Set flag to indicate we just onboarded a customer
      sessionStorage.setItem('justOnboarded', 'true');

      toast({
        title: 'Success!',
        description: `${customerData.name} has been added successfully${equipmentData ? ' with equipment details and an initial service ticket' : ''}.`,
        duration: 5000,
      });

      // Small delay to ensure data is committed before navigation
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create customer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const fieldName = field.name;

    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        rules={{ required: field.required ? `${field.label} is required` : false }}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel className="text-quikle-charcoal font-semibold">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  {...formField}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="min-h-[80px]"
                />
              ) : field.type === 'date' ? (
                <Input
                  {...formField}
                  type="date"
                  className="h-12"
                />
              ) : (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-12"
                  autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center quikle-gradient-bg">
        <Card className="w-full max-w-md glass-effect shadow-luxury">
          <CardContent className="pt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-quikle-primary mx-auto mb-4" />
            <p className="text-quikle-slate">Loading customer template...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
        <Card className="w-full max-w-md text-center glass-effect shadow-luxury">
          <CardContent className="pt-8">
            <div className="mx-auto mb-4 p-3 bg-yellow-500/10 rounded-full w-fit">
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Template Not Found</h3>
            <p className="text-quikle-slate mb-6">
              {error || `No customer template found for your industry: ${industry.replace('_', ' ')}.`}
            </p>
            <div className="space-y-3">
              <Button onClick={onComplete} className="w-full quikle-button-primary">
                Continue to Dashboard
              </Button>
              <Button onClick={onBack} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Company Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
      <Card className="w-full max-w-2xl glass-effect shadow-luxury">
        <CardHeader className="text-center pb-6">
          <OnboardingProgress currentStep={3} totalSteps={3} steps={onboardingSteps} />
          
          <div className="mx-auto mb-4 p-3 bg-quikle-secondary/10 rounded-full w-fit">
            <Users className="h-8 w-8 text-quikle-secondary" />
          </div>
          <CardTitle className="text-3xl font-bold luxury-text">Add Your First Customer</CardTitle>
          <CardDescription className="text-lg text-quikle-slate mt-2">
            {template.template_name} - Let's add your first customer with industry-specific details
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.field_definitions.fields.map((field) => renderField(field))}
              </div>

              <div className="flex gap-4 pt-8">
                <Button 
                  type="button" 
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 h-12 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-lg font-semibold quikle-button-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Customer...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFormStep;
