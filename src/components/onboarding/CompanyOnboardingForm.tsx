import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

const companySchema = z.object({
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  employee_count: z.number().min(1, 'Employee count must be at least 1'),
  business_type: z.string().min(1, 'Please select a business type'),
  company_address: z.string().min(5, 'Please provide a complete address'),
  company_email: z.string().email('Please enter a valid email address'),
  company_phone: z.string().min(10, 'Please enter a valid phone number'),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyOnboardingFormProps {
  onComplete: () => void;
}

const INDUSTRIES = [
  { value: 'printer_services', label: 'Printer Services' },
  { value: 'automotive_service', label: 'Automotive Service' },
  { value: 'broker', label: 'Real Estate Broker' },
  { value: 'marketing', label: 'Marketing Agency' },
  { value: 'attorney', label: 'Legal Services' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'nonprofit', label: 'Non-Profit' },
];

const CompanyOnboardingForm: React.FC<CompanyOnboardingFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company: '',
      industry: '',
      employee_count: 1,
      business_type: '',
      company_address: '',
      company_email: '',
      company_phone: '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const profileData = {
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...profileData })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Company Profile Created!',
        description: 'Your company information has been saved successfully.',
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving company profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save company profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
      <Card className="w-full max-w-2xl glass-effect shadow-luxury">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 p-3 bg-quikle-primary/10 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-quikle-primary" />
          </div>
          <CardTitle className="text-3xl font-bold luxury-text">Welcome to Quikle!</CardTitle>
          <CardDescription className="text-lg text-quikle-slate mt-2">
            Let's set up your company profile to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-quikle-charcoal font-semibold">Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your Company Name" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-quikle-charcoal font-semibold">Industry *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-quikle-charcoal font-semibold">Business Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-quikle-charcoal font-semibold">Number of Employees *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          placeholder="e.g. 10" 
                          className="h-12" 
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-quikle-charcoal font-semibold">Company Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="company@example.com" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-quikle-charcoal font-semibold">Company Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} placeholder="+1 (555) 123-4567" className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-quikle-charcoal font-semibold">Company Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="123 Business Street, City, State, ZIP Code" 
                          className="min-h-[80px]" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold quikle-button-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up your company...
                    </>
                  ) : (
                    'Complete Setup'
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

export default CompanyOnboardingForm;