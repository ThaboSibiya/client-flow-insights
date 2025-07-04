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
import { Loader2, Users } from 'lucide-react';

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

  const form = useForm<Record<string, any>>({
    defaultValues: {},
  });

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
        setTemplate(parsedData);

        // Set default values for the form
        const defaultValues: Record<string, any> = {};
        parsedData.field_definitions.fields.forEach((field: FieldDefinition) => {
          defaultValues[field.name] = '';
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
  }, [industry, form]);

  const onSubmit = async (data: Record<string, any>) => {
    if (!user || !template) return;

    setIsSubmitting(true);
    try {
      // Create a customer with industry-specific data
      const customerData = {
        user_id: user.id,
        name: data.company_name || data.client_name || data.name || 'New Customer',
        email: data.email || '',
        phone: data.phone_number || '',
        status: 'new' as const,
        notes: `Industry: ${industry}\n\nCustomer Details:\n${Object.entries(data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}`,
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your first customer has been added successfully.',
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
              {field.label} {field.required && '*'}
            </FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
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
              ) : (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-12"
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-quikle-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>No customer template found for your industry.</p>
            <Button onClick={onComplete} className="mt-4">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
      <Card className="w-full max-w-2xl glass-effect shadow-luxury">
        <CardHeader className="text-center pb-8">
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

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 h-12 text-lg font-semibold"
                >
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
                    'Complete Onboarding'
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

export default IndustrySpecificOnboarding;