
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Mail, MessageSquare, Clock, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const automationSettingsSchema = z.object({
  email_auto_send: z.boolean().default(false),
  email_template: z.string().default('default'),
  email_subject: z.string().optional().nullable(),
  email_message: z.string().optional().nullable(),
  whatsapp_enabled: z.boolean().default(false),
  whatsapp_template: z.string().optional().nullable(),
  follow_up_enabled: z.boolean().default(false),
  first_follow_up_days: z.coerce.number().int().min(1).default(3),
  second_follow_up_days: z.coerce.number().int().min(1).default(7),
  final_follow_up_days: z.coerce.number().int().min(1).default(14),
  reminder_template: z.string().optional().nullable(),
  auto_create_invoice_from_quote: z.boolean().default(false),
  send_on_create: z.boolean().default(false),
  mark_overdue_after_days: z.coerce.number().int().min(1).default(30),
});

type AutomationSettingsFormValues = z.infer<typeof automationSettingsSchema>;

const AutomationSettings = () => {
  const { settings, updateSettings, isLoading, isUpdating } = useAutomationSettings();

  const form = useForm<AutomationSettingsFormValues>({
    resolver: zodResolver(automationSettingsSchema),
    defaultValues: {
      email_auto_send: false,
      email_template: 'default',
      email_subject: 'Your Quote/Invoice from [Company Name]',
      email_message: `Hi [Customer Name],\n\nPlease find your quote/invoice attached.\n\nThank you for your business!\n\nBest regards,\n[Your Name]`,
      whatsapp_enabled: false,
      whatsapp_template: 'Hi [Customer Name], your quote/invoice is ready. Please check your email for details.',
      follow_up_enabled: false,
      first_follow_up_days: 3,
      second_follow_up_days: 7,
      final_follow_up_days: 14,
      reminder_template: `Hi [Customer Name],\n\nThis is a friendly reminder about your pending quote/invoice.\n\nPlease let us know if you have any questions.\n\nBest regards,\n[Your Name]`,
      auto_create_invoice_from_quote: false,
      send_on_create: false,
      mark_overdue_after_days: 30,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = async (data: AutomationSettingsFormValues) => {
    await updateSettings(data);
  };
  
  if (isLoading) {
    return <AutomationSettingsSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-quikle-charcoal">Automation Settings</h2>
          <Button type="submit" disabled={isUpdating} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Email Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <Mail className="h-5 w-5 text-quikle-primary" />
              Email Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email_auto_send"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Auto-send emails</FormLabel>
                    <p className="text-sm text-muted-foreground">Automatically send quotes/invoices via email when created</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="professional">Professional Template</SelectItem>
                      <SelectItem value="casual">Casual Template</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email_subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Email subject line..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} rows={5} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Available variables: [Customer Name], [Company Name], [Your Name], [Quote/Invoice Number]
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* WhatsApp Automation */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Automation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="whatsapp_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Enable WhatsApp notifications</FormLabel>
                                <p className="text-sm text-muted-foreground">Send quote/invoice notifications via WhatsApp</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="whatsapp_template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>WhatsApp Message Template</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} rows={3} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        {/* Follow-up Automation */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <Clock className="h-5 w-5 text-quikle-primary" />
                Follow-up Automation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="follow_up_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Enable automated follow-ups</FormLabel>
                                <p className="text-sm text-muted-foreground">Send reminder emails for unpaid invoices</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="first_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="second_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Second Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="final_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="reminder_template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reminder Email Template</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} rows={5} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        {/* General Automation Rules */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <Settings className="h-5 w-5 text-quikle-primary" />
                General Automation Rules
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="auto_create_invoice_from_quote"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Auto-create invoice from accepted quote</FormLabel>
                                <p className="text-sm text-muted-foreground">Automatically generate invoice when quote is accepted</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="send_on_create"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Send notifications on creation</FormLabel>
                                <p className="text-sm text-muted-foreground">Send email/WhatsApp when quote/invoice is created</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="mark_overdue_after_days"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mark invoices as overdue after (days)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} min="1" className="w-32" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
      </form>
    </Form>
  );
};

const AutomationSettingsSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-48 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
            </Card>
        ))}
    </div>
);

export default AutomationSettings;
