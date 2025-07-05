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
import { Loader2, Building2, ArrowLeft } from 'lucide-react';
import OnboardingProgress from './OnboardingProgress';
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence';
import { validatePhoneNumber, validateEmail, sanitizeTextInput } from '@/utils/onboardingValidation';
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';
import OnboardingOptimizer from './OnboardingOptimizer';
import KeyboardShortcuts from './KeyboardShortcuts';

const companySchema = z.object({
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .transform(sanitizeTextInput),
  industry: z.string().min(1, 'Please select an industry'),
  employee_count: z.number()
    .min(1, 'Employee count must be at least 1')
    .max(100000, 'Employee count seems unrealistic'),
  business_type: z.string().min(1, 'Please select a business type'),
  company_address: z.string()
    .min(10, 'Please provide a complete address')
    .max(500, 'Address must not exceed 500 characters')
    .transform(sanitizeTextInput),
  company_email: z.string()
    .refine(validateEmail, 'Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  company_phone: z.string()
    .refine(validatePhoneNumber, 'Please enter a valid phone number')
    .transform(val => val.trim()),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyOnboardingFormProps {
  onComplete: () => void;
  onBack?: () => void;
  allowSkip?: boolean;
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

const CompanyOnboardingForm: React.FC<CompanyOnboardingFormProps> = ({ 
  onComplete, 
  onBack, 
  allowSkip = false 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { trackStep, getCompletionRate } = useOnboardingAnalytics();
  
  const { persistedData, saveData, clearData } = useOnboardingPersistence('company', {
    company: '',
    industry: '',
    employee_count: 1,
    business_type: '',
    company_address: '',
    company_email: '',
    company_phone: '',
  });

  const onboardingSteps = [
    { key: 'company', title: 'Company Info', description: 'Business details' },
    { key: 'customer', title: 'First Customer', description: 'Add initial customer' },
    { key: 'complete', title: 'Complete', description: 'Setup finished' }
  ];

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: persistedData,
  });

  // Save form data on change and track analytics
  React.useEffect(() => {
    trackStep('company_form_viewed');
    
    const subscription = form.watch((value) => {
      if (Object.keys(value).length > 0) {
        saveData(value as CompanyFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveData, trackStep]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // First save company data without marking onboarding as complete
      const profileData = {
        ...data,
        onboarding_completed: false, // Will be set to true after customer step
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...profileData })
        .select()
        .single();

      if (error) throw error;

      // Clear persisted data after successful save
      clearData();

      // Track successful completion
      await trackStep('company_form_completed', { industry: data.industry });

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

  const handleSkip = () => {
    if (allowSkip) {
      toast({
        title: 'Skipped Setup',
        description: 'You can complete your profile later in settings.',
      });
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 quikle-gradient-bg">
      <Card className="w-full max-w-2xl glass-effect shadow-luxury">
        <CardHeader className="text-center pb-6">
          <OnboardingProgress currentStep="company" steps={onboardingSteps} />
          
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
                        <Input 
                          {...field} 
                          placeholder="Your Company Name" 
                          className="h-12"
                          aria-describedby="company-hint"
                          autoComplete="organization"
                        />
                      </FormControl>
                      <p id="company-hint" className="text-xs text-quikle-slate mt-1">
                        Enter your registered business name
                      </p>
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
                        <Input 
                          type="email" 
                          {...field} 
                          placeholder="company@example.com" 
                          className="h-12"
                          autoComplete="email"
                          aria-describedby="email-hint"
                        />
                      </FormControl>
                      <p id="email-hint" className="text-xs text-quikle-slate mt-1">
                        Main contact email for your business
                      </p>
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
                        <Input 
                          type="tel" 
                          {...field} 
                          placeholder="+1 (555) 123-4567" 
                          className="h-12"
                          autoComplete="tel"
                          aria-describedby="phone-hint"
                        />
                      </FormControl>
                      <p id="phone-hint" className="text-xs text-quikle-slate mt-1">
                        Include country code for international numbers
                      </p>
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

              <div className="flex gap-4 pt-8">
                {onBack && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onBack}
                    className="flex-1 h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`${onBack ? 'flex-1' : 'w-full'} h-12 text-lg font-semibold quikle-button-primary`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up your company...
                    </>
                  ) : (
                    'Continue to Customer Setup'
                  )}
                </Button>
                
                {allowSkip && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleSkip}
                    className="text-quikle-slate hover:text-quikle-primary"
                    disabled={isSubmitting}
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <OnboardingOptimizer
        currentStep="company"
        estimatedTimeRemaining={300} // 5 minutes estimated
        completionRate={getCompletionRate()}
        onSkipRecommendation={allowSkip ? handleSkip : undefined}
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

export default CompanyOnboardingForm;