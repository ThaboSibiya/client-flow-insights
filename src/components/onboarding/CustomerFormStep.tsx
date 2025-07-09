
import React, { useState, useEffect } from 'react';
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
      
      const { customerData, equipmentData } = parseCustomerData(data);

      console.log('Creating customer with structured data:', { customerData, equipmentData });

      const customer = await createCustomerWithEquipment(
        customerData,
        user.id,
        equipmentData
      );

      console.log('Customer created successfully:', customer);

      toast({
        title: 'Success!',
        description: `${customerData.name} has been added successfully${equipmentData ? ' with equipment details' : ''}.`,
        duration: 5000,
      });

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
                  className="min-h-[100px] resize-none"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quikle-crystal via-white to-quikle-platinum">
        <Card className="w-full max-w-md glass-effect shadow-luxury">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-quikle-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-quikle-charcoal mb-2">
              Loading Customer Form
            </h3>
            <p className="text-quikle-slate">
              Preparing industry-specific fields...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quikle-crystal via-white to-quikle-platinum">
        <Card className="w-full max-w-md glass-effect shadow-luxury">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-quikle-charcoal mb-2">
              Unable to Load Form
            </h3>
            <p className="text-quikle-slate mb-6">
              {error || 'No template found for this industry'}
            </p>
            <Button onClick={onBack} variant="outline" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-quikle-crystal via-white to-quikle-platinum">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto glass-effect shadow-luxury border-quikle-silver/30">
          <CardHeader className="border-b border-quikle-silver/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-quikle-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-quikle-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
                    Add Your First Customer
                  </CardTitle>
                  <CardDescription className="text-quikle-slate">
                    {template.template_name} - Customized for {industry.replace('_', ' ')}
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={onBack} 
                variant="ghost" 
                size="sm"
                className="text-quikle-slate hover:text-quikle-charcoal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {template.field_definitions.fields.map(renderField)}
                </div>

                <div className="flex gap-4 pt-6 border-t border-quikle-silver/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Company Setup
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-luxury"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Customer...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerFormStep;
