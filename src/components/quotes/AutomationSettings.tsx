
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form } from '@/components/ui/form';
import { AutomationSettingsSkeleton } from './automation/AutomationSettingsSkeleton';
import { EmailAutomationSettings } from './automation/EmailAutomationSettings';
import { WhatsAppAutomationSettings } from './automation/WhatsAppAutomationSettings';
import { FollowUpAutomationSettings } from './automation/FollowUpAutomationSettings';
import { GeneralAutomationSettings } from './automation/GeneralAutomationSettings';


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

        <EmailAutomationSettings />
        <WhatsAppAutomationSettings />
        <FollowUpAutomationSettings />
        <GeneralAutomationSettings />
        
      </form>
    </Form>
  );
};

export default AutomationSettings;
