
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const EmailAutomationSettings = () => {
  const { control, getFieldState, formState } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
          <Mail className="h-5 w-5 text-quikle-primary" />
          Email Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
  );
};
