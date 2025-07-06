import React, { useEffect, useState } from 'react';
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
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence';
import { validateTemplate, sanitizeTextInput } from '@/utils/onboardingValidation';
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';
import OnboardingOptimizer from './OnboardingOptimizer';
import KeyboardShortcuts from './KeyboardShortcuts';

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
  field_definitions: any;
}

interface IndustrySpecificOnboardingProps {
  industry: string;
  onComplete: () => void;
  onBack: () => void;
}

const IndustrySpecificOnboarding: React.FC<IndustrySpecificOnboardingProps> = ({
  industry,
  onComplete,
  onBack,
}) => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<CustomerTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { trackStep, getCompletionRate } = useOnboardingAnalytics();

  const { persistedData, saveData, clearData } = useOnboardingPersistence(`customer-${industry}`, {});
  
  const onboardingSteps = [
    { key: 'company', title: 'Company Info', description: 'Business details' },
    { key: 'customer', title: 'First Customer', description: 'Add initial customer' },
    { key: 'complete', title: 'Complete', description: 'Setup finished' }
  ];

  const form = useForm<Record<string, any>>({
    defaultValues: persistedData,
  });

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.keys(value).length > 0) {
        saveData(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveData]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('industry_customer_templates')
          .select('*')
          .eq('industry', industry)
          .single();

        if (error) throw error;
        
        // Parse the JSON field_definitions if it's a string
        const parsedData = {
          ...data,
          field_definitions: typeof data.field_definitions === 'string' 
            ? JSON.parse(data.field_definitions) 
            : data.field_definitions
        };

        // Validate template structure
        if (!validateTemplate(parsedData)) {
          throw new Error('Invalid template structure');
        }

        setTemplate(parsedData);

        // Track template loaded
        await trackStep('customer_template_loaded', { industry, templateName: parsedData.template_name });

        // Set default values for the form with persisted data taking precedence
        const defaultValues: Record<string, any> = {};
        parsedData.field_definitions.fields.forEach((field: FieldDefinition) => {
          defaultValues[field.name] = persistedData[field.name] || '';
        });
        form.reset(defaultValues);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          title: 'Error',
          description: 'Failed to load customer template',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [industry, form, persistedData]);

  const onSubmit = async (data: Record<string, any>) => {
    if (!user || !template) return;

    setIsSubmitting(true);
    try {
      // Sanitize all text inputs
      const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = sanitizeTextInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Create a customer with industry-specific data
      const customerData = {
        user_id: user.id,
        name: sanitizedData.company_name || sanitizedData.client_name || sanitizedData.name || 'New Customer',
        email: sanitizedData.email || '',
        phone: sanitizedData.phone_number || sanitizedData.phone || '',
        status: 'new' as const,
        notes: `Industry: ${industry.replace('_', ' ')}\n\nCustomer Details:\n${Object.entries(sanitizedData)
          .filter(([, value]) => value) // Only include non-empty values
          .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`)
          .join('\n')}`,
      };

      const { error: customerError } = await supabase
        .from('customers')
        .insert(customerData);

      if (customerError) throw customerError;

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Clear persisted data
      clearData();

      // Track onboarding completion
      await trackStep('onboarding_completed', { 
        industry, 
        customerName: sanitizedData.company_name || sanitizedData.client_name || sanitizedData.name 
      });

      toast({
        title: 'Success!',
        description: 'Your first customer has been added and onboarding is complete.',
        duration: 5000,
      });

      onComplete();
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
                  <SelectTrigger className="h-12" aria-describedby={`${fieldName}-hint`}>
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
                  aria-describedby={`${fieldName}-hint`}
                />
              ) : (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-12"
                  autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
                  aria-describedby={`${fieldName}-hint`}
                />
              )}
            </FormControl>
            {field.type === 'email' && (
              <p id={`${fieldName}-hint`} className="text-xs text-quikle-slate mt-1">
                We'll use this to contact the customer
              </p>
            )}
            {field.type === 'tel' && (
              <p id={`${fieldName}-hint`} className="text-xs text-quikle-slate mt-1">
                Include area code for best contact
              </p>
            )}
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

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
        <Card className="w-full max-w-md text-center glass-effect shadow-luxury">
          <CardContent className="pt-8">
            <div className="mx-auto mb-4 p-3 bg-yellow-500/10 rounded-full w-fit">
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Template Not Found</h3>
            <p className="text-quikle-slate mb-6">
              No customer template found for your industry: {industry.replace('_', ' ')}.
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
      
      <OnboardingOptimizer
        currentStep="customer"
        estimatedTimeRemaining={180}
        completionRate={getCompletionRate()}
      />
      
      <KeyboardShortcuts
        shortcuts={[]}
        onNext={() => form.handleSubmit(onSubmit)()}
        onBack={onBack}
        onSubmit={() => form.handleSubmit(onSubmit)()}
      />
    </div>
  );
};

export default IndustrySpecificOnboarding;
