
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCompanySetting } from '@/hooks/useCompanySettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AI_AGENT_PHONE_NUMBER_KEY = 'ai_agent_phone_number';
const AI_AGENT_FREE_ONLY_KEY = 'ai_agent_free_only';

const settingsSchema = z.object({
  phoneNumber: z.string().optional().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const AiAgentSettings = () => {
  const { setting, updateSetting, isLoading, isUpdating } = useCompanySetting(AI_AGENT_PHONE_NUMBER_KEY);
  const {
    setting: freeOnlySetting,
    updateSetting: updateFreeOnly,
    isLoading: isFreeOnlyLoading,
    isUpdating: isFreeOnlyUpdating,
  } = useCompanySetting(AI_AGENT_FREE_ONLY_KEY);

  const freeOnly = freeOnlySetting === true || freeOnlySetting === 'true';

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { phoneNumber: '' },
  });

  useEffect(() => {
    if (!isLoading && setting !== undefined) {
      form.reset({ phoneNumber: setting || '' });
    }
  }, [setting, isLoading, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    await updateSetting(data.phoneNumber);
  };

  const handleToggleFreeOnly = async (checked: boolean) => {
    await updateFreeOnly(checked);
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
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Settings</CardTitle>
          <CardDescription>Configure the settings for the AI Voice Agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Agent Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +15551234567" {...field} value={field.value ?? ''} />
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

    </div>
  );
};
