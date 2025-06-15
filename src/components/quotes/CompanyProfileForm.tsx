
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  company: z.string().optional().nullable(),
  company_email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')).nullable(),
  company_phone: z.string().optional().nullable(),
  company_address: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const CompanyProfileForm = () => {
    const { profile, updateCompanyProfile, isLoading } = useCompanyProfile();
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            company: '',
            company_email: '',
            company_phone: '',
            company_address: '',
        }
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                company: profile.company,
                company_email: profile.company_email,
                company_phone: profile.company_phone,
                company_address: profile.company_address,
            });
        }
    }, [profile, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await updateCompanyProfile(data);
            toast({
                title: 'Success',
                description: 'Company profile updated successfully.',
            });
        } catch (error) {
            // Error toast is handled in the hook
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>This information will appear on your quotes and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Company LLC" {...field} value={field.value ?? ''} />
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
                                    <FormLabel>Company Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contact@yourcompany.com" {...field} value={field.value ?? ''} />
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
                                    <FormLabel>Company Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 890" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="company_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="123 Business St, Suite 100&#10;City, Country" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                             {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Details'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
