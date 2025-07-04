
import React, { useState, useEffect } from 'react';
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
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import IndustrySpecificOnboarding from './IndustrySpecificOnboarding';

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
  const [useIndustryTemplate, setUseIndustryTemplate] = useState(false);
  const [userIndustry, setUserIndustry] = useState<string | null>(null);

  // Check if user has a company profile with industry
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('industry')
          .eq('id', user.id)
          .single();
        
        if (data?.industry) {
          setUserIndustry(data.industry);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

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

    try {
      await addCustomer({
        name: values.name,
        email: values.email,
        phone: values.phone,
        status: values.status as CustomerStatus,
        notes: values.notes || '',
      });
      
      form.reset();
      
      toast({
        title: "Success",
        description: `${values.name} has been successfully onboarded.`,
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
    }
  };

  // Show industry-specific form if user chooses to use it
  if (useIndustryTemplate && userIndustry) {
    return (
      <IndustrySpecificOnboarding
        industry={userIndustry}
        onComplete={() => {
          setUseIndustryTemplate(false);
          toast({
            title: 'Customer Added!',
            description: 'Customer has been successfully added with industry-specific details.',
          });
          setTimeout(() => navigate('/customers'), 1500);
        }}
        onBack={() => setUseIndustryTemplate(false)}
      />
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
      <CardHeader className="border-b border-quikle-silver/20">
        <CardTitle className="bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">Customer Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {userIndustry && (
          <div className="mb-6 bg-quikle-crystal/50 p-4 rounded-lg border border-quikle-primary/20">
            <p className="text-quikle-charcoal font-semibold mb-2">Industry-Specific Template Available</p>
            <p className="text-quikle-slate text-sm mb-3">
              We have a specialized form for your industry ({userIndustry.replace('_', ' ')}) with relevant fields.
            </p>
            <Button
              onClick={() => setUseIndustryTemplate(true)}
              variant="outline"
              className="border-quikle-primary text-quikle-primary hover:bg-quikle-primary hover:text-white"
            >
              Use Industry Template
            </Button>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <Button type="submit" className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-luxury">
              Add Customer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;
