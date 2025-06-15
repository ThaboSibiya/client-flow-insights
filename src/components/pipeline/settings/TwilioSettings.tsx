
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompanySetting } from '@/hooks/useCompanySettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const TWILIO_PHONE_NUMBER_KEY = 'twilio_phone_number';

const settingsSchema = z.object({
  phoneNumber: z.string().optional().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const TwilioSettings = () => {
  const { setting, updateSetting, isLoading, isUpdating } = useCompanySetting(TWILIO_PHONE_NUMBER_KEY);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      phoneNumber: '',
    }
  });

  useEffect(() => {
    if (!isLoading && setting !== undefined) {
      form.reset({ phoneNumber: setting || '' });
    }
  }, [setting, isLoading, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    await updateSetting(data.phoneNumber);
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          Twilio Configuration
        </CardTitle>
        <CardDescription>
          Connect your Twilio account to send SMS and WhatsApp messages from your automations.
          Your Account SID and Auth Token are configured securely as secrets.
          Don't have an account? <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-primary underline">Sign up here</a>.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Twilio Phone Number</FormLabel>
                              <FormControl>
                                  <Input placeholder="+15017122661" {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <Button type="submit" disabled={isUpdating}>
                       {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isUpdating ? 'Saving...' : 'Save Phone Number'}
                  </Button>
              </form>
          </Form>
      </CardContent>
    </Card>
  );
};

export default TwilioSettings;
